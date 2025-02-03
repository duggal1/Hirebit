import { ApplicationStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Define test case schema
export const testCaseSchema = z.object({
  input: z.string(),
  expected_output: z.string(),
  explanation: z.string()
});

export type TestCase = z.infer<typeof testCaseSchema>;

// Enhanced evaluation schema with stricter validation
export const evaluationSchema = z.object({
  score: z.number().min(0).max(100).default(0),
  quality: z.enum(["poor", "average", "good", "excellent"]).default("poor"),
  feedback: z.string().default("No feedback provided"),
  suggestions: z.array(z.string()).default([])
});

export type CodeEvaluationResult = z.infer<typeof evaluationSchema>;

export interface TestSubmission {
  jobId: string;
  code: string;
  results: CodeEvaluationResult[];
  status: ApplicationStatus;
  score: number;
}

export interface EvaluationMetrics {
  correctness: boolean;
  efficiency: number;
  maintainability: number;
  jobAlignment: number;
}

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    JobSeeker: true;
    Company: true;
  }
}>;

export interface TestData {
  problem_statement: string;
  description?: string;
  duration: number;
  requirements: {
    functional: string[];
    technical: string[];
    constraints: string[];
  };
  starter_code: string;
  test_cases: TestCase[];
  evaluation_criteria: {
    code_quality: number;
    performance: number;
    architecture: number;
    testing: number;
    documentation: number;
  };
}

export interface CodeEvaluation {
  score: number;
  feedback: string;
  correctness: boolean;
  efficiency: "low" | "medium" | "high";
  quality: "poor" | "average" | "excellent";
  suggestions: string[];
  realTimeSuggestions: string[];
  jobFitAnalysis: {
    strengthsForRole: string[];
    areasToImprove: string[];
    overallJobFit: string;
  };
  scalabilityScore: number;
  faultToleranceScore: number;
} 