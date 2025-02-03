"use server";

import { prisma } from "@/app/utils/db";
import { ApplicationStatus } from "@prisma/client";
import { requireUser } from "@/app/utils/hooks";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JobRequirements, jobRequirementsSchema } from "@/lib/job-schema";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function analyzeJobDescription(jobDescription: string): Promise<JobRequirements> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this job description and extract key technical requirements:

${jobDescription}

Return a JSON object with this structure (no markdown):
{
  "technical_skills": ["required technical skills"],
  "role_type": "frontend|backend|fullstack|other",
  "technical_requirements": {
    "languages": ["main programming languages"],
    "frameworks": ["main frameworks"],
    "tools": ["main tools"]
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const cleanedJson = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const parsedRequirements = JSON.parse(cleanedJson);
      return jobRequirementsSchema.parse(parsedRequirements);
    } catch (parseError) {
      console.error("Failed to parse requirements:", parseError);
      return {
        technical_skills: [],
        role_type: "fullstack",
        technical_requirements: {
          languages: [],
          frameworks: [],
          tools: []
        }
      };
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      technical_skills: [],
      role_type: "fullstack",
      technical_requirements: {
        languages: [],
        frameworks: [],
        tools: []
      }
    };
  }
}

async function generateTest(requirements: JobRequirements) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Clean and normalize the requirements
    const normalizedSkills = requirements.technical_skills
      .map(skill => skill.toLowerCase())
      .map(skill => skill.split(/[,\s]+/)) // Split on commas and spaces
      .flat()
      .filter(skill => skill.length > 2); // Filter out very short terms

    const normalizedTech = [
      ...requirements.technical_requirements.languages,
      ...requirements.technical_requirements.frameworks,
      ...requirements.technical_requirements.tools
    ]
      .map(tech => tech.toLowerCase())
      .map(tech => tech.split(/[,\s]+/))
      .flat()
      .filter(tech => tech.length > 2);

    const prompt = `You are a technical interviewer creating a coding test for a ${requirements.role_type} position.

Required skills and technologies:
${[...new Set([...normalizedSkills, ...normalizedTech])].map(skill => `- ${skill}`).join('\n')}

Create a challenging technical test that:
1. Tests their proficiency with these technologies
2. Presents real-world problems they'll face in this role
3. Evaluates their system design and implementation skills
4. Challenges their problem-solving abilities

The test should focus on practical implementation and system design.
Return a JSON response with:
{
  "problem_statement": "detailed problem description",
  "duration": number of minutes,
  "requirements": {
    "functional": ["what the system should do"],
    "technical": ["specific technical requirements"],
    "constraints": ["performance and scalability requirements"]
  },
  "questions": [
    {
      "title": "question title",
      "description": "detailed description",
      "difficulty": "Easy|Medium|Hard",
      "category": "category name",
      "hints": ["helpful hints"],
      "solution_approach": "high-level approach",
      "time_complexity": "if applicable",
      "space_complexity": "if applicable"
    }
  ],
  "test_cases": [
    {
      "input": "test input",
      "expected_output": "expected output",
      "explanation": "why this test matters"
    }
  ],
  "evaluation_criteria": {
    "code_quality": number,
    "performance": number,
    "architecture": number,
    "testing": number
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const cleanedJson = jsonMatch[0]
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/\\n/g, '\n')
        .trim();

      const parsed = JSON.parse(cleanedJson);

      // More flexible validation
      const testContent = JSON.stringify(parsed).toLowerCase();
      const requiredKeywords = [...new Set([...normalizedSkills, ...normalizedTech])]
        .filter(keyword => keyword.length > 3); // Only check significant keywords

      const missingKeywords = requiredKeywords.filter(keyword => {
        // Check for variations of the keyword
        const variations = [
          keyword,
          keyword.replace(/s$/, ''), // Remove trailing s
          keyword.replace(/ing$/, ''), // Remove ing
          keyword.replace(/ed$/, '') // Remove ed
        ];
        return !variations.some(v => testContent.includes(v));
      });

      // Only fail if missing critical keywords
      if (missingKeywords.length > requiredKeywords.length * 0.5) {
        console.warn("Missing keywords:", missingKeywords);
        // Instead of failing, try to regenerate with missing keywords
        const retryPrompt = prompt + `\n\nMake sure to include these specific technologies: ${missingKeywords.join(', ')}`;
        const retryResult = await model.generateContent(retryPrompt);
        const retryText = await retryResult.response.text();
        const retryJson = retryText.match(/\{[\s\S]*\}/)?.[0];
        if (retryJson) {
          return JSON.parse(retryJson);
        }
      }

      return parsed;
    } catch (error) {
      console.error("Test generation error:", error);
      throw new Error("Failed to generate appropriate test");
    }
  } catch (error) {
    console.error("Test generation error:", error);
    throw new Error("Failed to generate test");
  }
}

export async function getJobForTest(jobId: string) {
  const user = await requireUser();
  
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    throw new Error("Please complete your profile first");
  }

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

  if (!jobPost?.jobDescription) {
    throw new Error("Job not found or missing description");
  }

  // Check for existing application
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobSeekerId_jobId: {
        jobId: jobId,
        jobSeekerId: jobSeeker.id
      }
    }
  });

  if (existingApplication?.status !== "PENDING") {
    throw new Error("You have already completed this test");
  }

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

  // Generate test based on analyzed requirements
  const requirements = await analyzeJobDescription(jobPost.jobDescription);
  const test = await generateTest(requirements);

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
    return await prisma.jobApplication.update({
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
  } catch (error) {
    console.error("Test submission error:", error);
    throw new Error("Failed to submit test results");
  }
} 