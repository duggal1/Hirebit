import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate a coding test based on these job requirements:
    
    ${jobDescription}

    Respond with JSON:{
      "questions": [{
        "question": string,
        "starterCode": string,
        "testCases": { input: string, output: string }[],
        "difficulty": "easy"|"medium"|"hard"
      }],
      "duration": number, // minutes
      "skillsTested": string[]
    }`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim();
    
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const testData = JSON.parse(cleaned);

    return NextResponse.json(testData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate test" },
      { status: 500 }
    );
  }
}