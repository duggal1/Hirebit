export interface CodeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
}


export interface Performance {
  timeComplexity: string;
  spaceComplexity: string;
  runtime: number;
  memoryUsage: number;
  benchmarkData: {
    runtime: number;
    memoryUsage: number;
  }[];
}
export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
}

export interface CodeSubmission {
  code: string;
  language: string;
  problemId: string;
}

export interface ProblemSolvingScore {
  score: number;
  approach: string;
  creativity: string;
  edgeCases: string[];
}

export interface CodeQualityScore {
  score: number;
  patterns: string[];
  strengths: string[];
  suggestions: string[];
}

export interface TechnicalProficiency {
  score: number;
  advancedFeatures: string[];
  bestPractices: string[];
  areasOfExpertise: string[];
  improvementAreas: string[];
}

export interface PerformanceMetrics {
  timeComplexity: string;
  spaceComplexity: string;
  bottlenecks: string[];
  optimizations: string[];
}

export interface CodeAnalysis {
  strengths: string[];
  weaknesses: string[];
  bestPractices: string[];
  improvements: string[];
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  databases: string[];
  tools: string[];
  codeHighlights: string[];
  applicationType: string;
  languageUsage: string[];
}

export interface CodeHighlight {
  description: string;
  code: string;
  language: string;
}

export interface RealWorldAnalysis {
  isApplicable: boolean;
  applicableProblems: string[];
  requiredModifications: string[];
  targetIndustries: string[];
  businessValue: string;
}

export interface ProductionReadiness {
  scalabilityScore: number;
  infrastructureNeeds: string[];
  monitoringRequirements: string[];
  maintenanceNeeds: string[];
  estimatedCosts: string;
}

export interface CodeQualityMetrics {
  readabilityScore: number;
  readabilityAnalysis: string;
  maintainabilityScore: number;
  maintainabilityAnalysis: string;
  consistencyScore: number;
  consistencyAnalysis: string;
  documentationScore: number;
  documentationAnalysis: string;
  testingScore: number;
  testingAnalysis: string;
  qualityAssessments: QualityAssessment[];
}
export interface CodeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
}

// Add this line to create an alias
export type CodingQuestion = CodeProblem;
export interface QualityAssessment {
  category: string;
  score: number;
  analysis: string;
  recommendations: string[];
}
export interface EvaluationResult {
  score: number;
  executionTime: string;
  memory: string;
  problemSolvingScore: {
    score: number;
    approach: string;
    creativity: string;
    edgeCases: string[];
  };
  codeQualityScore: {
    score: number;
    patterns: string[];
    strengths: string[];
    suggestions: string[];
  };
  technicalProficiency: {
    score: number;
    advancedFeatures: string[];
    bestPractices: string[];
    areasOfExpertise: string[];
    improvementAreas: string[];
  };
  performanceMetrics: {
    timeComplexity: string;
    spaceComplexity: string;
    bottlenecks: string[];
    optimizations: string[];
  };
  codeAnalysis: CodeAnalysis;
  securityConsiderations: string;
  overallFeedback: string;
  learningResources: string[];
  realWorldAnalysis: {
    isApplicable: boolean;
    applicableProblems: string[];
    requiredModifications: string[];
    targetIndustries: string[];
    businessValue: string;
  };
  productionReadiness: {
    scalabilityScore: number;
    infrastructureNeeds: string[];
    monitoringRequirements: string[];
    maintenanceNeeds: string[];
    estimatedCosts: string;
  };
  techStack: {
    frontend: string[];
    backend: string[];
    databases: string[];
    tools: string[];
    codeHighlights: string[];
    applicationType: string;
    languageUsage: string[];
  };
  codeQualityMetrics: {
    readabilityScore: number;
    readabilityAnalysis: string;
    maintainabilityScore: number;
    maintainabilityAnalysis: string;
    consistencyScore: number;
    consistencyAnalysis: string;
    documentationScore: number;
    documentationAnalysis: string;
    testingScore: number;
    testingAnalysis: string;
    qualityAssessments: {
      category: string;
      score: number;
      analysis: string;
      recommendations: string[];
    }[];
  };
}