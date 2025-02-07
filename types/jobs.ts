export interface JobSkillsAnalysis {
  primarySkills: string[];
  secondarySkills: string[];
  experienceLevel: string;
  domainKnowledge: string[];
  complexityLevel: string;
  technicalAreas: string[];
  tooling: string[];
  systemDesign: string[];
}

export type SerializedJobSkillsAnalysis = {
  [K in keyof JobSkillsAnalysis]: JobSkillsAnalysis[K];
}

export interface QuestionGenerationContext {
  jobDescription: string;
  skills: JobSkillsAnalysis;
  difficulty: string;
  domainContext: string;
  industry: string;
  technicalContext: {
    primaryFocus: string[];
    systemConsiderations: string[];
    tooling: string[];
  };
}