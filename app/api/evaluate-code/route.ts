import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { CodeEvaluationResult } from "@/app/types/dto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { code, question } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Critically evaluate this code solution for senior-level position requirements:
  
  Question: ${question}
  Code: ${code}

  Consider:
  - Time/space complexity
  - Edge case handling
  - Code readability
  - Algorithm optimization

  Respond with strict JSON:
  {
    "score": 0-100,
    "feedback": "Detailed technical analysis",
    "correctness": boolean,
    "efficiency": "low|medium|high",
    "quality": "poor|average|excellent"
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim();
    const evaluation = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    return NextResponse.json<CodeEvaluationResult>(evaluation);
  } catch (error) {
    return NextResponse.json(
      { score: 0, feedback: "Evaluation failed" },
      { status: 500 }
    );
  }
}