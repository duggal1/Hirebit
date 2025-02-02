import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { code, question } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Evaluate this code solution:
  
  Question: ${question}
  Code: ${code}

  Respond with JSON:{
    "score": number (0-100),
    "feedback": string,
    "correctness": boolean,
    "efficiency": "low"|"medium"|"high"
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim();
    const evaluation = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json(
      { score: 0, feedback: "Evaluation failed" },
      { status: 500 }
    );
  }
}