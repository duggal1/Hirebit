import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/app/utils/db";
import { CodingQuestion } from "@/types/questions";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

/**
 * Generates one extremely advanced PhD-level coding challenge based on the provided skills.
 */
async function generatePhdCodingQuestion(
  skills: string[],
  jobTitle: string
): Promise<CodingQuestion | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `
Generate 1 advanced PhD-level coding challenge for a ${jobTitle} position that solves a real-world problem using cutting-edge techniques. The challenge should test the following skills: ${skills.join(', ')}.
Return ONLY a valid JSON object with this structure:
{
  "title": "A descriptive title",
  "description": "Detailed problem description with context and requirements",
  "difficulty": "PhD",
  "timeLimit": 7200,
  "testCases": [
    {"input": "input format", "expectedOutput": "output format"},
    {"input": "input format", "expectedOutput": "output format"}
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "examples": [
    {"input": "example input", "output": "example output", "explanation": "explanation"}
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = (await result.response).text();

    // Clean the response by removing any markdown or extra formatting
    text = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/`/g, '')
      .trim();

    // Look for a JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON object not found in the response');
    }

    const jsonStr = jsonMatch[0];
    const parsedQuestion = JSON.parse(jsonStr);

    return {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...parsedQuestion,
      difficulty: "PhD", // enforce PhD-level
      timeLimit: 7200
    };
  } catch (error) {
    console.error("Error generating coding question:", error);
    return null;
  }
}

/**
 * Generates a hint for the provided coding question.
 */
async function generatePhdCodingQuestionHint(question: CodingQuestion): Promise<string | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `
Based on the following coding challenge:
Title: ${question.title}
Description: ${question.description}

Provide a concise hint that guides the candidate on how to approach solving this problem without revealing the full solution.
Return ONLY the hint as plain text.
`;

  try {
    const result = await model.generateContent(prompt);
    let text = (await result.response).text();
    text = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/`/g, '')
      .trim();
    return text;
  } catch (error) {
    console.error("Error generating hint for coding question:", error);
    return null;
  }
}

/**
 * Finds a job post by ID and generates a coding question using the job's required skills.
 */
export async function generateQuestionForJob(jobPostId: string): Promise<CodingQuestion> {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobPostId }
    });

    if (!jobPost) {
      throw new Error("Job post not found");
    }

    // Use the skillsRequired field directly (an array of strings)
    const { skillsRequired, jobTitle } = jobPost;
    console.log(`Generating coding question for "${jobTitle}" using skills: ${skillsRequired.join(", ")}`);

    const question = await generatePhdCodingQuestion(skillsRequired, jobTitle);
    if (question) {
      console.log("Successfully generated coding question:", question.title);
      return question;
    }
    throw new Error("Failed to generate coding question.");
  } catch (error) {
    console.error("Error generating question for job:", error);
    throw error;
  }
}

export default generatePhdCodingQuestion;
export { generatePhdCodingQuestionHint };
