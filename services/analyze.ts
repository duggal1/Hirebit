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
    // Apply rate limiting
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

    const prompt = `
      Analyze this job description and extract the following information in JSON format.
      Return only the JSON object without any additional text or markdown formatting.
      
      Required format:
      {
        "primarySkills": ["list of must-have technical skills"],
        "secondarySkills": ["list of nice-to-have skills"],
        "experienceLevel": "years of experience required",
        "domainKnowledge": ["specific domain expertise required"],
        "complexityLevel": "Expert",
        "technicalAreas": ["specific technical areas of focus"],
        "tooling": ["required tools and technologies"],
        "systemDesign": ["system design considerations if applicable"]
      }

      Job Description:
      ${jobPost.jobDescription}

      Company Context:
      Industry: ${jobPost.company.industry}
      About: ${jobPost.company.about}
      Role: ${jobPost.jobTitle}

      Focus on extracting technical requirements, skills, and expertise levels.
      Ensure all arrays have at least 2-3 items for completeness.
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Clean and parse the response
      const responseText = response.text().trim();
      const cleanJSON = responseText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      let analysis: JobSkillsAnalysis;
      try {
        analysis = JSON.parse(cleanJSON);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.debug('Raw response:', responseText);
        throw new Error('Invalid AI response format');
      }

      // Validate and ensure all required fields with default values
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

      // Cache the analysis results
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

    } catch (aiError) {
      console.error('AI processing error:', aiError);
      throw new Error('Failed to process job requirements');
    }

  } catch (error) {
    console.error('Job analysis error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze job requirements'
    );
  }
}

// Helper functions
function ensureArray(value: unknown): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(item => String(item));
  }
  return ['Not specified'];
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
