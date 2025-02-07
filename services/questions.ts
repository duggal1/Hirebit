import { CodingQuestion } from '@/types/questions';
import { QuestionGenerationContext } from '@/types/jobs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function generateQuestionFromJobContext(
  context: QuestionGenerationContext
): Promise<CodingQuestion> {
  const prompt = `
    Generate a complex, real-world coding challenge based on these requirements:
    
    Job Context:
    ${context.domainContext}
    
    Required Skills: ${context.skills.primarySkills.join(', ')}
    Domain Knowledge: ${context.skills.domainKnowledge.join(', ')}
    Experience Level: ${context.skills.experienceLevel}
    
    Create a challenging problem that:
    1. Tests the candidate's expertise in: ${context.skills.primarySkills.slice(0, 3).join(', ')}
    2. Requires system design consideration for scale
    3. Includes real-world constraints and edge cases
    4. Matches senior/expert level difficulty
    5. Relates to the company's domain: ${context.domainContext.split('-')[0].trim()}
    
    Return a JSON object with:
    {
      "id": "unique-string",
      "title": "Problem Title",
      "description": "Detailed problem description with context and requirements",
      "difficulty": "Expert",
      "timeLimit": 3600,
      "testCases": [
        {
          "input": "example input format",
          "expectedOutput": "expected output format"
        }
      ],
      "constraints": [
        "List of technical constraints",
        "Performance requirements",
        "Scale considerations"
      ],
      "examples": [
        {
          "input": "simple example input",
          "output": "example output",
          "explanation": "Detailed explanation of the solution approach"
        }
      ]
    }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question: CodingQuestion = JSON.parse(response.text());

    // Validate the generated question
    if (!validateQuestion(question)) {
      throw new Error('Generated question does not meet requirements');
    }

    return question;
  } catch (error) {
    console.error('Failed to generate question:', error);
    throw new Error('Failed to generate valid question format');
  }
}

function validateQuestion(question: CodingQuestion): boolean {
  return (
    !!question.id &&
    !!question.title &&
    !!question.description &&
    Array.isArray(question.testCases) &&
    question.testCases.length >= 2 &&
    Array.isArray(question.constraints) &&
    Array.isArray(question.examples) &&
    question.examples.length >= 1
  );
}

export async function generateQuestionsForJob(jobPostId: string): Promise<CodingQuestion[]> {
  const analysis = await import('./analyze').then(m => m.analyzeJobPost(jobPostId));
  
  // Generate multiple questions with different focus areas
  const questions = await Promise.all([
    generateQuestionFromJobContext({
      ...analysis,
      difficulty: 'Expert'
    }),
    generateQuestionFromJobContext({
      ...analysis,
      difficulty: 'Expert',
      skills: {
        ...analysis.skills,
        primarySkills: analysis.skills.primarySkills.slice(3, 6) // Different skills focus
      }
    })
  ]);

  return questions;
}