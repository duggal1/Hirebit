import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { CodeEvaluationResult } from "@/app/types/dto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { code, question, jobRequirements } = await req.json();

  if (!jobRequirements) {
    return NextResponse.json(
      { error: "Job requirements are needed for evaluation" },
      { status: 400 }
    );
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Evaluate this code solution specifically against the job requirements.
  
  JOB REQUIREMENTS:
  ${jobRequirements}

  TASK:
  ${question}

  SUBMITTED CODE:
  ${code}

  EVALUATION INSTRUCTIONS:
  1. Focus ONLY on requirements mentioned in the job description
  2. Check if the code uses the specific technologies/frameworks required
  3. Evaluate based on company's tech stack and standards
  4. Consider real-world production readiness
  5. Look for job-specific best practices

  Evaluate specifically:
  - Use of required technologies
  - Implementation of job-specific features
  - Code quality standards for this role
  - Error handling as per job level
  - Performance for the expected scale
  - Best practices for the company's stack

  Respond with strict JSON:
  {
    "score": 0-100,
    "feedback": "Detailed analysis focusing on job requirements",
    "correctness": boolean,
    "efficiency": "low|medium|high",
    "quality": "poor|average|excellent",
    "realTimeSuggestions": [
      "Improvements specific to job requirements",
      "Best practices for this company's stack",
      "Production readiness suggestions"
    ],
    "jobFitAnalysis": {
      "strengthsForRole": ["Specific strengths matching job requirements"],
      "areasToImprove": ["Skills needed for this specific role"],
      "overallJobFit": "Detailed analysis of code vs job requirements"
    }
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim();
    const evaluation = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    
    // Validate evaluation matches job context
    if (!evaluation.jobFitAnalysis?.strengthsForRole?.length) {
      throw new Error("Evaluation failed to consider job requirements");
    }
    
    return NextResponse.json<CodeEvaluationResult>(evaluation);
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { 
        score: 0, 
        feedback: "Failed to evaluate against job requirements",
        correctness: false,
        efficiency: "low",
        quality: "poor",
        realTimeSuggestions: [],
        jobFitAnalysis: {
          strengthsForRole: [],
          areasToImprove: [],
          overallJobFit: "Could not evaluate against job requirements"
        }
      },
      { status: 500 }
    );
  }
}