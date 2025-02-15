import { prisma } from '@/app/utils/db';
import { rateLimit } from '@/lib/utils';
import { JobSkillsAnalysis, QuestionGenerationContext } from '@/types/jobs';
import { GoogleGenerativeAI } from '@google/generative-ai';


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// Create a rate limiter: 100 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100
});

export async function analyzeJobPost(jobPostId: string): Promise<QuestionGenerationContext> {
  try {
    await limiter.check();

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobPostId },
      select: {
        jobDescription: true,
        jobTitle: true,
        company: {
          select: {
            name: true,
            about: true,
            industry: true
          }
        }
      }
    });

    if (!jobPost) {
      throw new Error('Job post not found');
    }

    // Updated prompt to be more specific
    const prompt = `
      Analyze this job description and extract technical requirements.
      Return ONLY a JSON object with this exact structure (no code, no explanation):

      {
        "primarySkills": ["skill1", "skill2"],
        "secondarySkills": ["skill1", "skill2"],
        "experienceLevel": "Senior",
        "domainKnowledge": ["domain1", "domain2"],
        "complexityLevel": "Expert",
        "technicalAreas": ["area1", "area2"],
        "tooling": ["tool1", "tool2"],
        "systemDesign": ["consideration1", "consideration2"]
      }

      Job Description: ${jobPost.jobDescription}
      Role: ${jobPost.jobTitle}
      Industry: ${jobPost.company.industry}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('Raw AI Response:', response.text());

    try {
      // Clean and parse the response
      const cleanedResponse = cleanAIResponse(response.text());
      console.log('Cleaned Response:', cleanedResponse);

      const analysis = JSON.parse(cleanedResponse);

      // Validate and normalize the analysis
      const validatedAnalysis: JobSkillsAnalysis = {
        primarySkills: ensureArray(analysis.primarySkills),
        secondarySkills: ensureArray(analysis.secondarySkills),
        experienceLevel: analysis.experienceLevel || 'Senior',
        domainKnowledge: ensureArray(analysis.domainKnowledge),
        complexityLevel: validateComplexityLevel(analysis.complexityLevel),
        technicalAreas: ensureArray(analysis.technicalAreas),
        tooling: ensureArray(analysis.tooling),
        systemDesign: ensureArray(analysis.systemDesign)
      };

      // Cache the results
      await cacheAnalysisResults(jobPostId, validatedAnalysis);

      return {
        jobDescription: jobPost.jobDescription,
        skills: validatedAnalysis,
        difficulty: validatedAnalysis.complexityLevel,
        domainContext: formatDomainContext(jobPost),
        industry: jobPost.company.industry,
        technicalContext: {
          primaryFocus: validatedAnalysis.primarySkills.slice(0, 3),
          systemConsiderations: validatedAnalysis.systemDesign,
          tooling: validatedAnalysis.tooling
        }
      };

    } catch (parseError) {
      console.error('Analysis parsing error:', parseError);
      // Return default analysis instead of throwing
      return createDefaultAnalysis(jobPost);
    }

  } catch (error) {
    console.error('Job analysis error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze job requirements'
    );
  }
}

// Add this helper function for default analysis
function createDefaultAnalysis(jobPost: any): QuestionGenerationContext {
  const defaultSkills: JobSkillsAnalysis = {
    primarySkills: ['Software Development', 'Problem Solving'],
    secondarySkills: ['Team Collaboration', 'Communication'],
    experienceLevel: 'Senior',
    domainKnowledge: ['Software Engineering'],
    complexityLevel: 'Expert',
    technicalAreas: ['Backend Development', 'API Design'],
    tooling: ['Version Control', 'Development Tools'],
    systemDesign: ['Scalability', 'Performance']
  };

  return {
    jobDescription: jobPost.jobDescription,
    skills: defaultSkills,
    difficulty: 'Expert',
    domainContext: formatDomainContext(jobPost),
    industry: jobPost.company.industry,
    technicalContext: {
      primaryFocus: defaultSkills.primarySkills.slice(0, 3),
      systemConsiderations: defaultSkills.systemDesign,
      tooling: defaultSkills.tooling
    }
  };
}

// Helper functions
function ensureArray(value: unknown): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(item => String(item));
  }
  return ['Not specified'];
}
function cleanAIResponse(response: string): string {
  try {
    // First, try to find JSON-like content
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    let jsonStr = jsonMatch[0];

    // Enhanced cleaning steps
    jsonStr = jsonStr
      // Remove code blocks and markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`/g, '')
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      // Normalize whitespace
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // More comprehensive JSON structure cleanup
    jsonStr = jsonStr
      // Handle unquoted property names more aggressively
      .replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')
      // Fix property names with special characters
      .replace(/([{,]\s*)([^"{\s][^:]*?)(\s*:)/g, '$1"$2"$3')
      // Normalize string values
      .replace(/:\s*'([^']*)'(?=\s*[,}])/g, ':"$1"')
      .replace(/:\s*"([^"]*)"(?=\s*[,}])/g, ':"$1"')
      // Fix boolean and number values
      .replace(/:\s*(true|false|null)(?=\s*[,}])/g, ':"$1"')
      .replace(/:\s*(-?\d+\.?\d*)(?=\s*[,}])/g, ':"$1"')
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix array formatting with improved handling
      .replace(/\[(.*?)\]/g, (match, content) => {
        const items = content.split(',')
          .map((item: string) => item.trim())
          .filter(Boolean)
          .map((item: string) => {
            // Ensure all array items are properly quoted
            item = item.replace(/^['"](.*)['"]$/, '$1'); // Remove existing quotes
            return `"${item.replace(/"/g, '\\"')}"`;    // Add new quotes and escape internal quotes
          });
        return `[${items.join(',')}]`;
      });

    // Additional validation
    if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
      throw new Error('Invalid JSON structure');
    }

    // Try to parse and format
    const parsed = JSON.parse(jsonStr);
    
    // Ensure all required fields exist with proper types
    const requiredFields = [
      'primarySkills',
      'secondarySkills',
      'experienceLevel',
      'domainKnowledge',
      'complexityLevel',
      'technicalAreas',
      'tooling',
      'systemDesign'
    ];

    for (const field of requiredFields) {
      if (!(field in parsed)) {
        parsed[field] = field.endsWith('Skills') || field.endsWith('Knowledge') || 
                       field === 'technicalAreas' || field === 'tooling' || 
                       field === 'systemDesign' 
                       ? ["Not specified"] 
                       : "Not specified";
      }
      // Ensure arrays are actually arrays
      if (Array.isArray(parsed[field])) {
        parsed[field] = parsed[field].map(String);
      } else if (typeof parsed[field] !== 'string') {
        parsed[field] = String(parsed[field]);
      }
    }

    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error('Failed to clean AI response:', error);
    // Return a guaranteed valid JSON structure
    return JSON.stringify({
      primarySkills: ["Not specified"],
      secondarySkills: ["Not specified"],
      experienceLevel: "Senior",
      domainKnowledge: ["Not specified"],
      complexityLevel: "Expert",
      technicalAreas: ["Not specified"],
      tooling: ["Not specified"],
      systemDesign: ["Not specified"]
    }, null, 2);
  }
}

function validateComplexityLevel(level: unknown): string {
  const validLevels = ['Entry', 'Intermediate', 'Senior', 'Expert'];
  return validLevels.includes(String(level)) ? String(level) : 'Expert';
}

function formatDomainContext(jobPost: any): string {
  return `${jobPost.company.name} - ${jobPost.jobTitle}\n${jobPost.company.about}`;
}

async function cacheAnalysisResults(jobId: string, analysis: JobSkillsAnalysis) {
  try {
    const serializedAnalysis = JSON.stringify(analysis);
    await prisma.jobAnalysis.upsert({
      where: { jobPostId: jobId },
      update: { 
        analysis: serializedAnalysis as any // Type assertion needed for Prisma Json type
      },
      create: {
        jobPostId: jobId,
        analysis: serializedAnalysis as any
      }
    });
  } catch (error) {
    console.error('Failed to cache analysis:', error);
  }
}

export async function getJobAnalysis(jobId: string): Promise<JobSkillsAnalysis | null> {
  try {
    const cached = await prisma.jobAnalysis.findUnique({
      where: { jobPostId: jobId }
    });
    return cached?.analysis ? JSON.parse(cached.analysis as string) : null;
  } catch (error) {
    console.error('Failed to retrieve cached analysis:', error);
    return null;
  }
}
