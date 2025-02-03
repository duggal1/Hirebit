import { z } from "zod";
import { createExtractionChainFromZod } from "langchain/chains";

export const jobRequirementsSchema = z.object({
  technical_skills: z.array(z.string().min(1)).min(1),
  certifications: z.array(z.string()).optional().describe("Any required certifications"),
  education: z.enum(["none", "bachelors", "masters", "phd"]).describe("Minimum education requirement"),
  experience: z.object({
    years: z.number().min(0).max(50),
    domains: z.array(z.string().min(1)).min(1)
  }),
  soft_skills: z.array(z.string()).optional().describe("Required soft skills"),
  technical_requirements: z.object({
    languages: z.array(z.string().min(1)).min(1),
    frameworks: z.array(z.string().min(1)),
    tools: z.array(z.string().min(1))
  }),
  performance_metrics: z.array(z.string()).optional().describe("Expected performance metrics")
}).refine(data => 
  data.technical_requirements.languages.length > 0, 
  "At least one programming language is required"
);

export type JobRequirements = z.infer<typeof jobRequirementsSchema>;

export const createExtractionChain = (llm: any) => 
  createExtractionChainFromZod(jobRequirementsSchema, llm); 