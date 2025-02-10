import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/app/utils/db";
import { CodingQuestion } from "@/types/questions";
import { JobSkillsAnalysis } from "@/types/jobs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

async function extractSkillsFromDescription(description: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
    Analyze this job description and extract technical skills.
    Job Description: "${description}"
    
    Respond with ONLY a JSON object in this exact format (no additional text):
    {
      "programmingLanguages": ["language1", "language2"],
      "frameworks": ["framework1", "framework2"],
      "tools": ["tool1", "tool2"],
      "concepts": ["concept1", "concept2"]
    }

    Rules:
    1. Include only relevant skills found in the description
    2. Return valid JSON only, no markdown, no backticks
    3. At least one item per array
    4. If a category has no skills, use ["None specified"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Debug log
    console.log('Raw AI response:', text);

    // Clean the response more thoroughly
    text = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/`/g, '')
      .trim();

    // Find JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON object found in response');
      throw new Error('Invalid response format');
    }

    const jsonStr = jsonMatch[0];
    console.log('Cleaned JSON:', jsonStr);

    try {
      const parsed = JSON.parse(jsonStr);
      return {
        programmingLanguages: ensureArray(parsed.programmingLanguages),
        frameworks: ensureArray(parsed.frameworks),
        tools: ensureArray(parsed.tools),
        concepts: ensureArray(parsed.concepts)
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON format');
    }
  } catch (error) {
    console.error('Skill extraction error:', error);
    return getDefaultSkills();
  }
}

// Helper functions
function ensureArray(value: unknown): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String);
  }
  return ["None specified"];
}

function getDefaultSkills() {
  return {
    programmingLanguages: ["General programming"],
    frameworks: ["Standard libraries"],
    tools: ["Development tools"],
    concepts: ["Problem solving"]
  };
}

/**
 * Generates SIX extremely advanced, PhD-level coding challenges.
 * Each challenge is designed to be as complex as possible and to solve real-world problems,
 * using every possible skill (languages, frameworks, tools, and concepts) extracted from the job description.
 */
async function generateQuestionsBasedOnSkills(
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    tools: string[];
    concepts: string[];
  },
  jobTitle: string
): Promise<CodingQuestion[] | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
    Create SIX extremely advanced and complex coding challenges for a ${jobTitle} position.
    These challenges must be at a PhD-level of difficulty, tackling real-world problems that require
    innovative, robust, and highly efficient solutions. The challenges should push the boundaries of
    algorithmic thinking, system design, and the application of modern technologies.
    
    Skills to test:
    - Languages: ${skills.programmingLanguages.join(', ')}
    - Frameworks: ${skills.frameworks.join(', ')}
    - Tools: ${skills.tools.join(', ')}
    - Concepts: ${skills.concepts.join(', ')}
    
    Return ONLY a JSON array containing SIX objects. Each object must follow this structure:
    {
      "title": "A clear and descriptive problem title",
      "description": "A detailed description of the problem that includes real-world context and requirements",
      "difficulty": "PhD",
      "timeLimit": 7200,
      "testCases": [
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
    
    Requirements:
    1. Each challenge must be extremely challenging and advanced, requiring deep algorithmic and system design skills.
    2. The problems should be directly relevant to the job skills and qualifications.
    3. Each problem must include at least 2 test cases.
    4. Provide clear and specific constraints, as well as detailed input/output formats.
    5. Do not include any markdown formatting, backticks, or additional commentary – return strictly valid JSON.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Debug log
    console.log('Raw advanced questions response:', text);

    // Clean the response
    text = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/`/g, '')
      .trim();

    // Attempt to parse the JSON array
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(text);
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 6) {
        console.error('The generated JSON is not an array of six questions.');
        throw new Error('Invalid generated questions format');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON format for advanced questions');
    }

    // Validate each question
    const validQuestions: CodingQuestion[] = [];
    for (const question of parsedQuestions) {
      if (!isValidQuestion(question)) {
        console.error('One of the generated questions does not meet the requirements:', question);
        throw new Error('Generated question does not meet requirements');
      }
      // Assign a unique id and enforce advanced settings
      validQuestions.push({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...question,
        difficulty: "PhD",
        timeLimit: 7200
      });
    }
    
    return validQuestions;

  } catch (error) {
    console.error('Advanced question generation error:', error);
    return null;
  }
}

// Validation helper for a single question
function isValidQuestion(question: any): boolean {
  return (
    question &&
    typeof question.title === 'string' && question.title.trim().length > 0 &&
    typeof question.description === 'string' && question.description.trim().length > 0 &&
    Array.isArray(question.testCases) && question.testCases.length >= 2 &&
    Array.isArray(question.constraints) && question.constraints.length > 0 &&
    Array.isArray(question.examples) && question.examples.length > 0
  );
}

// Update the main function to generate SIX advanced questions based on job post skills
export async function generateQuestionsForJob(jobPostId: string) {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { 
        id: jobPostId 
      },
      include: {
        company: true,
        JobAnalysis: true  // Note the capital J to match the schema
      }
    });

    if (!jobPost) {
      throw new Error('Job post not found');
    }

    console.log('Processing job:', jobPost.jobTitle);

    // First try to get cached analysis
    let skills;
    if (jobPost.JobAnalysis?.analysis) {  // Note the capital J
      try {
        skills = JSON.parse(jobPost.JobAnalysis.analysis as string);
        console.log('Using cached skills analysis');
      } catch (e) {
        console.log('Invalid cached analysis, extracting new skills');
      }
    }
    // Extract skills if no cache or invalid cache
    if (!skills) {
      console.log('Extracting skills from job description...');
      skills = await extractSkillsFromDescription(jobPost.jobDescription);
      console.log('Extracted skills:', skills);
    }

    // Generate SIX advanced questions based on the extracted skills
    const questions = await generateQuestionsBasedOnSkills(skills, jobPost.jobTitle);
    
    if (questions && Array.isArray(questions) && questions.length === 6) {
      console.log('Successfully generated advanced questions:', questions.map(q => q.title));
      return questions;
    }

    console.log('Using fallback advanced questions');
    // Fallback: generate 6 fallback questions
    const fallbackQuestions: CodingQuestion[] = [];
    for (let i = 0; i < 6; i++) {
      fallbackQuestions.push({
        id: `${jobPostId}-default-${Date.now()}-${i}`,
        title: `${jobPost.jobTitle} Advanced Technical Assessment ${i + 1}`,
        description: `Develop an innovative solution demonstrating advanced proficiency in ${skills.programmingLanguages.join(
          ', '
        )} along with a deep understanding of ${skills.frameworks.join(
          ', '
        )}, ${skills.tools.join(', ')}, and ${skills.concepts.join(
          ', '
        )}. The problem should simulate a real-world scenario that requires complex system design and high-performance algorithms.`,
        difficulty: "PhD",
        timeLimit: 7200,
        testCases: [
          {
            input: "complex input scenario 1",
            expectedOutput: "expected complex output 1"
          },
          {
            input: "complex input scenario 2",
            expectedOutput: "expected complex output 2"
          }
        ],
        constraints: [
          "Utilize advanced algorithmic strategies",
          "Optimize for performance and scalability",
          "Implement robust error handling"
        ],
        examples: [
          {
            input: "example complex input",
            output: "example expected output",
            explanation: "This example demonstrates an advanced scenario with multiple edge cases"
          }
        ]
      });
    }
    return fallbackQuestions;

  } catch (error) {
    console.error('Error in generating advanced questions:', error);
    throw error;
  }
}
