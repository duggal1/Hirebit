export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: "PhD";
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

export interface QuestionSet {
  questions: CodingQuestion[];
  currentQuestionIndex: number;
  completed: boolean;
}