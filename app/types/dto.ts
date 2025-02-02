import { ApplicationStatus } from "@prisma/client";

export interface CodeEvaluationResult {
  score: number;
  feedback: string;
  correctness: boolean;
  efficiency: "low"|"medium"|"high";
}

export interface TestSubmission {
  jobId: string;
  code: string;
  results: CodeEvaluationResult[];
  status: ApplicationStatus;
  score: number;
} 