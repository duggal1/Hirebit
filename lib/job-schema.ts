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