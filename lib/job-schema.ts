import { z } from "zod";
import { createExtractionChainFromZod } from "langchain/chains";

export const jobRequirementsSchema = z.object({
  technical_skills: z.array(z.string()).default([]),
  role_type: z.string().default("fullstack"),
  technical_requirements: z.object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([])
  }).default({
    languages: [],
    frameworks: [],
    tools: []
  })
}).strict();

export type JobRequirements = z.infer<typeof jobRequirementsSchema>;

export const createExtractionChain = (llm: any) => 
  createExtractionChainFromZod(jobRequirementsSchema, llm);

export const evaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  correctness: z.boolean(),
  efficiency: z.enum(["low", "medium", "high"]),
  quality: z.enum(["poor", "average", "excellent"]),
  suggestions: z.array(z.string()),
  technicalAssessment: z.object({
    algorithmicComplexity: z.string(),
    spaceComplexity: z.string(),
    edgeCasesCovered: z.boolean().default(false),
    securityConsiderations: z.boolean().default(false),
    bestPracticesFollowed: z.boolean().default(false)
  }),
  performanceMetrics: z.object({
    timeComplexity: z.string(),
    memoryUsage: z.string(),
    concurrencyHandling: z.boolean().default(false),
    resourceEfficiency: z.number().min(0).max(100)
  }),
  jobFitAnalysis: z.object({
    strengthsForRole: z.array(z.string()).optional(),
    areasToImprove: z.array(z.string()).optional(),
    overallJobFit: z.string().optional()
  }).optional()
}).passthrough(); 