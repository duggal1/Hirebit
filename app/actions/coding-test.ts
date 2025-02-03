"use server";

import { prisma } from "@/app/utils/db";
import { ApplicationStatus } from "@prisma/client";
import { requireUser } from "@/app/utils/hooks";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { evaluationSchema, JobRequirements, jobRequirementsSchema } from "@/lib/job-schema";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Add more specific error handling
class GeminiAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

// Improved retry utility with better error handling
async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T> | T,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.log("Max retries reached, using fallback");
        return fallback();
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return fallback();
}

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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create 5 extremely complex coding challenges based on these skills: ${requirements.technical_skills.join(', ')}.
Each challenge must be a real production problem that tests system design and scalability.

Example challenge types based on skills:
- For Next.js: Build a real-time collaborative code editor with multi-user editing, version control
- For Python/Django: Create a distributed task processing system handling millions of jobs
- For React: Implement a complex state management system with offline support
- For Node.js: Build a real-time analytics pipeline processing terabytes
- For System Design: Create a multi-region data replication system

Return ONLY a JSON array like this (no extra text):
[{
  "problem": "Detailed problem description",
  "requirements": ["req1", "req2"],
  "test_cases": [{"input": "test input", "output": "expected output", "explanation": "why"}],
  "starter_code": "code here"
}]`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text())
      .replace(/```json\s*|```/g, '')
      .trim();
    
    // Find the JSON array
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    const jsonStr = text.slice(start, end);
    
    const parsed = JSON.parse(jsonStr);
    
    return parsed.slice(0, 5).map((q: any) => ({
      problem_statement: q.problem,
      requirements: {
        functional: q.requirements || [],
        system_design: q.system_design || [],
        performance: q.performance || [],
        security: q.security || []
      },
      test_cases: q.test_cases?.map((t: any) => ({
        input: t.input,
        expected_output: t.output,
        explanation: t.explanation
      })) || [],
      starter_code: q.starter_code || generateStarterCode(requirements, q.problem),
      evaluation_criteria: {
        code_quality: 20,
        performance: 25,
        architecture: 25,
        testing: 15,
        documentation: 15
      }
    }));
  } catch (error) {
    console.error('Test generation error:', error);
    return generateFallbackTest(requirements);
  }
}

function generateStarterCode(requirements: JobRequirements, problem: string) {
  // Generate specific starter code based on the problem and requirements
  if (requirements.technical_skills.some(s => s.toLowerCase().includes('next') || s.toLowerCase().includes('react'))) {
    return `import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Solution() {
  // Implement your solution here
  // Requirements:
  // - Handle real-time updates
  // - Manage complex state
  // - Implement caching
  // - Handle offline mode
  return (
    <div>
      {/* Implement your UI */}
    </div>
  )
}`;
  }
  
  if (requirements.technical_skills.some(s => s.toLowerCase().includes('python') || s.toLowerCase().includes('django'))) {
    return `from typing import Dict, List
from fastapi import FastAPI, HTTPException
from redis import Redis
from sqlalchemy import create_engine
from pydantic import BaseModel

app = FastAPI()
redis = Redis()
db = create_engine("postgresql://")

class Solution:
    def __init__(self):
        """Initialize your distributed system"""
        self.cache = redis
        self.db = db
        
    async def process(self, data: Dict) -> Dict:
        """
        Implement your solution here
        Handle:
        - High throughput
        - Data consistency
        - Fault tolerance
        """
        pass`;
  }
  
  return `// Implement your solution here
// Requirements from problem: ${problem}`;
}

// Enhanced fallback test generator with more specific challenges
function generateFallbackTest(requirements: JobRequirements) {
  const challenges = [
    {
      title: "Real-time Collaborative System",
      context: "Build a collaborative document editor with real-time sync, conflict resolution, and offline support",
    },
    {
      title: "High-Performance Data Pipeline",
      context: "Create a data processing pipeline handling 1TB/hour with exactly-once delivery",
    },
    {
      title: "Distributed Caching System",
      context: "Build a distributed caching system with eventual consistency and partition tolerance",
    },
    {
      title: "Scalable Search Engine",
      context: "Implement a search engine with real-time indexing and complex query support",
    },
    {
      title: "Multi-tenant SaaS Platform",
      context: "Design a multi-tenant system with data isolation and custom policy support",
    }
  ].map(c => ({
    ...c,
    requirements: requirements.technical_skills
  }));

  return challenges.map(challenge => ({
    problem_statement: `${challenge.title}: ${challenge.context} using ${challenge.requirements.join(', ')}`,
    requirements: {
      functional: [
        "Support multi-user collaboration",
        "Handle concurrent modifications",
        "Provide real-time updates",
        "Support offline mode"
      ],
      system_design: [
        "Implement CQRS pattern",
        "Use event sourcing",
        "Handle distributed transactions",
        "Implement proper sharding"
      ],
      performance: [
        "<100ms response time",
        "Support 100k concurrent users",
        "Handle 1M operations/second",
        "99.99% availability"
      ],
      security: [
        "End-to-end encryption",
        "Role-based access control",
        "Audit logging",
        "Rate limiting"
      ]
    },
    test_cases: [
      {
        input: "Concurrent users: 100k, Operations: 1M/s",
        expected_output: "All operations processed, No data loss",
        explanation: "Tests system under extreme load"
      }
    ],
    starter_code: generateStarterCode(requirements, challenge.context),
    evaluation_criteria: {
      code_quality: 20,
      performance: 25,
      architecture: 25,
      testing: 15,
      documentation: 15
    }
  }));
}

export async function getJobForTest(jobId: string) {
  try {
    const user = await requireUser();
    
    // Fetch the job seeker profile directly
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!jobSeeker) {
      throw new Error("Job seeker profile not found");
    }

    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobId,
          jobSeekerId: jobSeeker.id
        }
      }
    });

    if (!existingApplication) {
      await prisma.jobApplication.create({
        data: {
          jobId,
          jobSeekerId: jobSeeker.id,
          status: "PENDING",
          resume: "test-resume",
        }
      });
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

    // Generate test based on analyzed requirements
    const requirements = await analyzeJobDescription(jobPost.jobDescription);
    const test = await generateTest(requirements);

    return {
      ...jobPost,
      test
    };
  } catch (error) {
    console.error("Test generation error:", error);
    throw new Error("Failed to generate test");
  }
}

export async function submitTestResults(data: {
  jobId: string;
  code: string;
  results: any[];
}) {
  const user = await requireUser();
  
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });
  
  if (!jobSeeker) throw new Error("Job seeker profile not found");

  // Validate with current schema
  const validation = evaluationSchema.safeParse(data.results[0]);
  if (!validation.success) {
    console.error('Validation error:', validation.error);
    throw new Error("Invalid test results format");
  }

  await prisma.jobApplication.update({
    where: {
      jobSeekerId_jobId: {
        jobId: data.jobId,
        jobSeekerId: jobSeeker.id
      }
    },
    data: {
      status: validation.data.score > 70 ? "SHORTLISTED" : "REJECTED",
      aiScore: validation.data.score,
      answers: validation.data
    }
  });

  return { success: true };
} 