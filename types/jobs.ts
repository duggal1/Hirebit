export interface JobSkillsAnalysis {
    primarySkills: string[];
    secondarySkills: string[];
    experienceLevel: string;
    domainKnowledge: string[];
    complexityLevel: 'Basic' | 'Intermediate' | 'Expert';
  }
  
  export interface QuestionGenerationContext {
    jobDescription: string;
    skills: JobSkillsAnalysis;
    difficulty: string;
    domainContext: string;
  }