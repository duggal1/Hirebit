"use server";

import { prisma } from "@/app/utils/db";
import { ApplicationStatus } from "@prisma/client";
import { requireUser } from "@/app/utils/hooks";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JobRequirements, jobRequirementsSchema } from "@/lib/job-schema";
import { RunnableSequence } from "@langchain/core/runnables";
import { createStructuredOutput } from "@/lib/structured-chain";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function analyzeJobDescription(jobDescription: string) {
  try {
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro-latest",
      maxOutputTokens: 4096,
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert HR technical analyst. Extract requirements in JSON format."],
      ["human", `Extract these fields from the job description:
      {input}
      
      Required JSON format:
      {
        "technical_skills": ["skill1", "skill2"],
        "experience": {
          "years": number,
          "domains": ["industry1", "industry2"]
        },
        "technical_requirements": {
          "languages": ["lang1", "lang2"],
          "frameworks": ["framework1", "framework2"],
          "tools": ["tool1", "tool2"]
        }
      }`]
    ]);

    const chain = prompt.pipe(model);
    
    return await createStructuredOutput(
      jobRequirementsSchema,
      chain,
      jobDescription
    );
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Job requirements analysis failed. Please ensure the description contains technical details like programming languages, frameworks, and experience requirements.');
  }
}

async function generateTest(requirements: JobRequirements) {
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    maxOutputTokens: 4096,
    apiKey: process.env.GEMINI_API_KEY
  });

  const testPrompt = `Generate an expert-level coding test based on these EXACT requirements:
  
  ${JSON.stringify(requirements, null, 2)}

  The test must:
  1. Require implementation of ${requirements.technical_requirements.languages[0]} 
  2. Cover ${requirements.technical_skills.join(', ')}
  3. Include real-world constraints: ${requirements.performance_metrics?.join(', ') || "N/A"}
  4. Validate ${requirements.experience.domains[0]} domain knowledge
  5. Test ${requirements.experience.years}+ years experience level

  Return JSON with:
  {
    "problem_statement": "complex real-world problem",
    "technical_requirements": ["specific implementation needs"],
    "acceptance_criteria": {
      "functional": ["core requirements"],
      "non_functional": ["performance", "security", "scalability"]
    },
    "evaluation_matrix": {
      "code_quality": 30,
      "performance": 25,
      "architecture": 20,
      "testing": 15,
      "documentation": 10
    }
  }`;

  const { content } = await model.invoke(testPrompt);
  return JSON.parse(content.toString());
}

export async function getJobForTest(jobId: string) {
  const user = await requireUser();
  
  // Get the job seeker profile
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    throw new Error("Please complete your profile first");
  }

  // Get job with full details including description
  const jobPost = await prisma.jobPost.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      jobTitle: true,
      jobDescription: true,
      employmentType: true,
      company: {
        select: {
          name: true,
          logo: true
        }
      }
    }
  });

  if (!jobPost) {
    throw new Error("Job not found");
  }

  if (!jobPost.jobDescription) {
    throw new Error("Job description is required to generate the test");
  }

  // Check for existing completed application
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobSeekerId_jobId: {
        jobId: jobId,
        jobSeekerId: jobSeeker.id
      }
    }
  });

  // If there's an existing application that's not pending, prevent retaking
  if (existingApplication && existingApplication.status !== "PENDING") {
    throw new Error("You have already completed this test");
  }

  // If no application exists, create one
  if (!existingApplication) {
    await prisma.jobApplication.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobId: jobId,
        status: "PENDING",
        resume: jobSeeker.resume
      }
    });
  }

  // Generate the test based on job description
  const test = await generateTest(await analyzeJobDescription(jobPost.jobDescription));

  return {
    ...jobPost,
    test
  };
}

export async function submitTestResults(data: {
  jobId: string;
  code: string;
  results: any[];
  status: ApplicationStatus;
  score: number;
}) {
  const user = await requireUser();
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    throw new Error("Job seeker profile not found");
  }

  try {
    const result = await prisma.jobApplication.update({
      where: {
        jobSeekerId_jobId: {
          jobId: data.jobId,
          jobSeekerId: jobSeeker.id
        }
      },
      data: {
        status: data.status,
        aiScore: data.score,
        answers: data.results,
        resume: data.code
      }
    });

    return result;
  } catch (error) {
    console.error("Test submission error:", error);
    throw new Error("Failed to submit test results");
  }
} 