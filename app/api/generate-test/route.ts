import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate a comprehensive coding test based on these job requirements:
    
    ${jobDescription}

    Create 3 challenging questions that test the core skills mentioned. Follow this exact JSON format:
    {
      "questions": [{
        "question": "Clear problem statement with input/output examples",
        "starterCode": "Relevant code skeleton",
        "testCases": [{ "input": "exact", "output": "exact" }],
        "difficulty": "easy|medium|hard",
        "skillsTested": ["specific_skill_1", "specific_skill_2"]
      }],
      "duration": 90,
      "skillsTested": ["all_skills_combined"],
      "evaluationCriteria": ["efficiency", "correctness", "readability"]
    }

    Ensure each question and the overall test has skillsTested as an array of strings.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim();
    
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let testData = JSON.parse(cleaned);

    // Ensure skillsTested is always an array
    if (!Array.isArray(testData.skillsTested)) {
      testData.skillsTested = [];
    }

    // Ensure each question has skillsTested as an array
    testData.questions = testData.questions.map(q => ({
      ...q,
      skillsTested: Array.isArray(q.skillsTested) ? q.skillsTested : []
    }));

    return NextResponse.json(testData);
  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate test" },
      { status: 500 }
    );
  }
}