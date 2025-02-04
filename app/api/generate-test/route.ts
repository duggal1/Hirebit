import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { jobRequirementsSchema } from "@/lib/job-schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First analyze job requirements
    const requirementsPrompt = `Analyze this job description and extract key technical requirements:
${jobDescription}
Return a JSON object with technical skills and requirements.`;

    const requirementsResult = await model.generateContent(requirementsPrompt);
    const requirements = jobRequirementsSchema.parse(
      JSON.parse(requirementsResult.response.text().replace(/```json\s*|```/g, '').trim())
    );

    // Then generate extremely complex coding challenges
    const prompt = `Based on the following job description, generate 5 extremely complex and extremely hard coding challenges. Each challenge must:
1. Reflect real-world production scenarios at scale (1M+ users)
2. Require advanced system design and algorithmic thinking
3. Include edge cases that would break naive solutions
4. Enforce optimal time/space complexity (O(1) or O(n) only)
5. Consider security, error handling, and distributed system issues

For each challenge, output a JSON object with the following structure:
{
  "title": "Challenge Title",
  "problem_statement": "Detailed problem description with technical requirements and expected outcomes.",
  "technical_requirements": {
    "languages": ["list of required programming languages"],
    "frameworks": ["list of required frameworks"],
    "complexity": "O(1)/O(n)"
  },
  "acceptance_criteria": [
    "List of criteria such as handling 100k+ concurrent requests, 99.999% availability, etc."
  ],
  "starter_code": "A sample buggy implementation as a starting point",
  "hints": ["List of non-obvious hints"]
}

Only use the job description details below to decide the challenge complexity and required skills:
${jobDescription}`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text())
      .replace(/```json\s*|```/g, '')
      .trim();

    // Extract the JSON array from the response
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    const jsonStr = text.slice(start, end);

    const questions = JSON.parse(jsonStr)
      .slice(0, 5)
      .map((q: any) => ({
        problem_statement: q.problem_statement || q.problem,
        requirements: {
          functional: q.requirements || [],
          system_design: q.system_design || [],
          performance: q.performance || [],
          security: q.security || []
        },
        test_cases: (q.test_cases || []).map((t: any) => ({
          input: t.input,
          expected_output: t.expected_output,
          explanation: t.explanation
        })),
        starter_code: q.starter_code || generateDefaultStarterCode(requirements),
        evaluation_criteria: {
          code_quality: 20,
          performance: 25,
          architecture: 25,
          testing: 15,
          documentation: 15
        }
      }));

    return NextResponse.json(questions);

  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json(generateFallbackQuestions(), { status: 200 });
  }
}

function generateDefaultStarterCode(requirements: any) {
  const hasNextOrReact = requirements.technical_skills?.some(
    (s: string) => s.toLowerCase().includes('next') || s.toLowerCase().includes('react')
  );

  if (hasNextOrReact) {
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

  const hasPythonOrDjango = requirements.technical_skills?.some(
    (s: string) => s.toLowerCase().includes('python') || s.toLowerCase().includes('django')
  );

  if (hasPythonOrDjango) {
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
// Requirements from job: ${requirements.technical_skills?.join(', ') || 'N/A'}`;
}

function generateFallbackQuestions() {
  const challenges = [
    {
      title: "Real-time Collaborative Editor",
      context: "Build a collaborative editor with real-time sync and offline support"
    },
    {
      title: "High-Scale Data Pipeline",
      context: "Create a data pipeline handling 1TB/hour with exactly-once delivery"
    },
    {
      title: "Distributed Cache",
      context: "Build a distributed cache with consistency and partition tolerance"
    }
  ];

  return challenges.map(challenge => ({
    problem_statement: `${challenge.title}: ${challenge.context}`,
    requirements: {
      functional: [
        "Support real-time collaboration",
        "Handle concurrent edits",
        "Provide offline support"
      ],
      system_design: [
        "Use CRDT for consistency",
        "Implement proper sharding",
        "Handle network partitions"
      ],
      performance: [
        "<100ms response time",
        "Support 100k users",
        "Handle 1M ops/second"
      ]
    },
    test_cases: [
      {
        input: "100k concurrent users",
        expected_output: "All operations processed",
        explanation: "Tests scale"
      }
    ],
    starter_code: generateDefaultStarterCode({}),
    evaluation_criteria: {
      code_quality: 20,
      performance: 25,
      architecture: 25,
      testing: 15,
      documentation: 15
    }
  }));
}
