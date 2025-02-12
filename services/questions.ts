import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/app/utils/db";
import { CodingQuestion } from "@/types/questions";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

/**
 * Generates one extremely advanced PhD-level coding challenge based on the provided skills.
 * The challenge is designed to solve a real-world problem using cutting-edge techniques.
 */
async function generatePhdCodingQuestion(
  skills: string[],
  jobTitle: string
): Promise<CodingQuestion | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `
    Create ONLY 1 extremely advanced and highly complex coding challenge for a ${jobTitle} position.
    The problem must be at PhD-level difficulty, addressing a real-world problem with innovative, robust,
    and scalable solutions using state-of-the-art algorithms and system design. The challenge should test
    the following skills: ${skills.join(', ')}.
    
    Return ONLY a valid JSON object (no markdown or extra text) with the following structure:
    {
      "title": "A clear and descriptive problem title",
      "description": "A detailed description of the problem including real-world context and requirements",
      "difficulty": "PhD",
      "timeLimit": 7200,
      "testCases": [
        {
          "input": "detailed input format",
          "expectedOutput": "detailed expected output format"
        },
        {
          "input": "detailed input format",
          "expectedOutput": "detailed expected output format"
        }
      ],
      "constraints": [
        "specific constraint 1",
        "specific constraint 2"
      ],
      "examples": [
        {
          "input": "example input",
          "output": "example output",
          "explanation": "detailed explanation of the example"
        }
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

    // Fallback default question if AI generation fails
    console.warn("Falling back to a default coding question.");
    return {
      id: `default-${Date.now()}`,
      title: `${jobTitle} Advanced Coding Challenge`,
      description: `Design and implement an innovative solution addressing a complex real-world problem.
        The solution should demonstrate expert-level proficiency in the required skills: ${skillsRequired.join(', ')}.
        Emphasize advanced algorithmic strategies, robust system design, and scalability.`,
      difficulty: "PhD",
      timeLimit: 7200,
      testCases: [
        {
          input: "sample complex input 1",
          expectedOutput: "expected output 1"
        },
        {
          input: "sample complex input 2",
          expectedOutput: "expected output 2"
        }
      ],
      constraints: [
        "Utilize advanced algorithms and data structures",
        "Optimize for performance and scalability"
      ],
      examples: [
        {
          input: "example input",
          output: "example output",
          explanation: "This example demonstrates how the solution addresses multiple edge cases and system constraints."
        }
      ]
    };
  } catch (error) {
    console.error("Error generating question for job:", error);
    throw error;
  }
}


export default generatePhdCodingQuestion;