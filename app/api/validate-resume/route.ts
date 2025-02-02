import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function isValidUrl(url: string) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { resumeUrl } = await req.json();
    
    // Validate URL
    if (!resumeUrl || !isValidUrl(resumeUrl)) {
      return NextResponse.json(
        { error: "Invalid or missing resume URL" },
        { status: 400 }
      );
    }

    // Normalize UploadThing URLs
    const normalizedUrl = resumeUrl.startsWith('https://uploadthing.com/f/') 
      ? `https://utfs.io/f/${resumeUrl.split('/f/')[1]}`
      : resumeUrl;

    // Add additional validation for UTFS.io URLs
    if (!normalizedUrl.startsWith('https://utfs.io/f/')) {
      return NextResponse.json(
        { error: "Invalid resume URL format" },
        { status: 400 }
      );
    }

    // Modify the PDF fetch with better error handling
    let pdfBuffer: ArrayBuffer;
    try {
      const pdfResponse = await fetch(normalizedUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        redirect: 'follow',
        timeout: 10000 // 10 second timeout
      });

      if (!pdfResponse.ok) throw new Error(`HTTP ${pdfResponse.status}`);
      
      const contentType = pdfResponse.headers.get('Content-Type');
      if (!contentType?.includes('application/pdf')) {
        throw new Error('Invalid PDF content type');
      }

      pdfBuffer = await pdfResponse.arrayBuffer();
    } catch (error) {
      console.error('PDF fetch error:', error);
      return NextResponse.json(
        { 
          error: "Failed to download resume", 
          details: error instanceof Error ? error.message : "Unknown error" 
        },
        { status: 400 }
      );
    }
    
    // Load PDF content
    const loader = new PDFLoader(new Blob([pdfBuffer]), {
      parsedItemSeparator: " ",
      splitPages: false
    });
    
    const docs = await loader.load();
    const resumeText = docs.map(doc => doc.pageContent).join('\n');

    if (!resumeText.trim()) {
      return NextResponse.json({
        isValid: false,
        feedback: {
          strengths: [],
          improvements: ["The PDF appears to be empty or unreadable"],
          overallFeedback: "Please upload a valid resume PDF file"
        }
      }, { status: 400 });
    }

    // Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze this resume and provide structured feedback. Follow these rules:
    1. ALWAYS provide 3-5 strengths even if resume needs improvements
    2. Focus on technical skills, experience, and education
    3. Provide actionable improvement suggestions
    
    Resume text:
    ${resumeText.substring(0, 30000)}
    
    Respond with JSON:{
      "isValid": boolean,
      "feedback": {
        "strengths": string[],  // Minimum 3 items
        "improvements": string[],  // Minimum 3 items
        "overallFeedback": string
      },
      "skills": string[],
      "experience": { "years": number, "level": "entry"|"mid"|"senior" },
      "education": { "degree": string, "institution": string, "year": number }[]
    }`;

    const result = await model.generateContent(prompt);
    const analysisText = (await result.response.text()).trim();
    
    const cleanedResponse = analysisText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const analysis = JSON.parse(cleanedResponse);
      return NextResponse.json(analysis);
    } catch (error) {
      return NextResponse.json({
        isValid: false,
        feedback: {
          strengths: [],
          improvements: ["Failed to analyze resume content"],
          overallFeedback: "Invalid resume format or structure"
        }
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Resume validation error:', error);
    return NextResponse.json({
      isValid: false,
      feedback: {
        strengths: [],
        improvements: ["Error processing resume"],
        overallFeedback: "Please try again with a different file"
      }
    }, { status: 500 });
  }
}