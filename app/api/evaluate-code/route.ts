import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this code and return EXACTLY this JSON format:
{
  "score": 0-100,
  "quality": "poor|average|good|excellent",
  "feedback": "Concise technical assessment",
  "suggestions": ["Practical improvement 1", "Practical improvement 2"]
}

Code to evaluate:
${code}

Focus on:
- Code correctness
- Algorithm efficiency
- Error handling
- Best practices`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text())
               .replace(/```json|```/g, '')
               .trim();

    // Parse and validate response
    const response = JSON.parse(text);
    
    const validatedData = {
      score: Math.min(100, Math.max(0, response.score || 0)),
      quality: ["poor","average","good","excellent"].includes(response.quality) 
               ? response.quality : "poor",
      feedback: response.feedback || "No detailed analysis available",
      suggestions: Array.isArray(response.suggestions) 
                 ? response.suggestions.slice(0, 3)
                 : []
    };

    return NextResponse.json(validatedData);

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({
      score: 0,
      quality: "poor",
      feedback: "Evaluation failed - please try again",
      suggestions: []
    }, { status: 500 });
  }
}