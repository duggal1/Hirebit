import { prisma } from '@/app/utils/db';
import { JobSkillsAnalysis, QuestionGenerationContext } from '@/types/jobs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function analyzeJobPost(jobPostId: string): Promise<QuestionGenerationContext> {
  const jobPost = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    select: {
      jobDescription: true,
      jobTitle: true,
      company: {
        select: {
          name: true,
          about: true
        }
      }
    }
  });

  if (!jobPost) throw new Error('Job post not found');

  const prompt = `
    Analyze this job description and extract the following information in JSON format:
    {
      "primarySkills": ["list of must-have technical skills"],
      "secondarySkills": ["list of nice-to-have skills"],
      "experienceLevel": "years of experience required",
      "domainKnowledge": ["specific domain expertise required"],
      "complexityLevel": "Expert"
    }

    Job Description:
    ${jobPost.jobDescription}

    Company Context:
    ${jobPost.company.about}

    Role: ${jobPost.jobTitle}

    Please ensure the analysis is thorough and focuses on technical requirements.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis: JobSkillsAnalysis = JSON.parse(response.text());

    // Validate and ensure all required fields are present
    const validatedAnalysis: JobSkillsAnalysis = {
      primarySkills: analysis.primarySkills || [],
      secondarySkills: analysis.secondarySkills || [],
      experienceLevel: analysis.experienceLevel || 'Senior',
      domainKnowledge: analysis.domainKnowledge || [],
      complexityLevel: analysis.complexityLevel || 'Expert'
    };

    return {
      jobDescription: jobPost.jobDescription,
      skills: validatedAnalysis,
      difficulty: validatedAnalysis.complexityLevel,
      domainContext: `${jobPost.company.name} - ${jobPost.jobTitle}\n${jobPost.company.about}`
    };
  } catch (error) {
    console.error('Failed to analyze job post:', error);
    throw new Error('Failed to analyze job requirements');
  }
}