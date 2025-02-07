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
    4. If a category has no skills, use ["None specified"]`;

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

async function generateQuestionBasedOnSkills(
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    tools: string[];
    concepts: string[];
  },
  jobTitle: string
): Promise<CodingQuestion | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
    Create ONE coding challenge for a ${jobTitle} position.
    Skills to test:
    - Languages: ${skills.programmingLanguages.join(', ')}
    - Frameworks: ${skills.frameworks.join(', ')}
    - Tools: ${skills.tools.join(', ')}
    - Concepts: ${skills.concepts.join(', ')}
    
    Return ONLY a JSON object with this structure:
    {
      "title": "Clear problem title",
      "description": "Detailed description of what needs to be implemented",
      "difficulty": "Expert",
      "timeLimit": 3600,
      "testCases": [
        {
          "input": "specific input format",
          "expectedOutput": "expected output format"
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
          "explanation": "clear explanation"
        }
      ]
    }

    Requirements:
    1. Problem should be relevant to the job skills
    2. Include at least 2 test cases
    3. Include specific constraints
    4. Provide clear input/output formats
    5. No markdown, no backticks, just valid JSON`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Debug log
    console.log('Raw question response:', text);

    // Clean and parse JSON
    text = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/`/g, '')
      .trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsedQuestion = JSON.parse(jsonMatch[0]);

    // Validate the question
    if (!isValidQuestion(parsedQuestion)) {
      throw new Error('Generated question does not meet requirements');
    }

    return {
      id: `q-${Date.now()}`,
      ...parsedQuestion,
      difficulty: "Expert",
      timeLimit: 3600
    };

  } catch (error) {
    console.error('Question generation error:', error);
    return null;
  }
}

// Validation helper
function isValidQuestion(question: any): boolean {
  return (
    question &&
    typeof question.title === 'string' && question.title.length > 0 &&
    typeof question.description === 'string' && question.description.length > 0 &&
    Array.isArray(question.testCases) && question.testCases.length >= 2 &&
    Array.isArray(question.constraints) && question.constraints.length > 0 &&
    Array.isArray(question.examples) && question.examples.length > 0
  );
}

// Update the question generation to use the extracted skills
export async function generateQuestionsForJob(jobPostId: string) {
  try {
    // Update the include statement to properly fetch jobAnalysis
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

    // Generate question based on skills
    const question = await generateQuestionBasedOnSkills(skills, jobPost.jobTitle);
    
    if (question) {
      console.log('Successfully generated question:', question.title);
      return [question];
    }

    console.log('Using fallback question');
    return [{
      id: `${jobPostId}-default-${Date.now()}`,
      title: `${jobPost.jobTitle} Technical Assessment`,
      description: `Implement a solution that demonstrates proficiency in: ${skills.programmingLanguages.join(', ')}`,
      difficulty: "Expert",
      timeLimit: 3600,
      testCases: [{
        input: "sample input",
        expectedOutput: "expected output"
      }],
      constraints: [
        "Use one or more of the required technologies",
        "Implement error handling",
        "Consider performance"
      ],
      examples: [{
        input: "example input",
        output: "example output",
        explanation: "Basic test case"
      }]
    }];

  } catch (error) {
    console.error('Error in question generation:', error);
    throw error;
  }
}