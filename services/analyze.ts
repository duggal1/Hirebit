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
// Add this helper function for cleaning AI responses
function cleanAIResponse(response: string): string {
  // Remove code blocks and comments
  let cleaned = response
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\/\/.*/g, '')         // Remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .trim();

  // Try to find a JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON object found in response');
  }

  return jsonMatch[0];
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
