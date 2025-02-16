import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function isValidUrl(url: string) {
  try {
    const newUrl = new URL(url);
    // Allow both uploadthing.com and utfs.io URLs
    return (
      newUrl.hostname === "uploadthing.com" ||
      newUrl.hostname.endsWith(".uploadthing.com") ||
      newUrl.hostname === "utfs.io"
    );
  } catch (e) {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeUrl } = body;

    console.log("Received resume URL:", resumeUrl); // Debug log

    // Validate URL
    if (!resumeUrl) {
      return NextResponse.json(
        { error: "Missing resume URL" },
        { status: 400 }
      );
    }

    if (!isValidUrl(resumeUrl)) {
      return NextResponse.json(
        { error: "Invalid resume URL format. Must be from UploadThing." },
        { status: 400 }
      );
    }

    // Normalize UploadThing URLs
    const normalizedUrl = resumeUrl.startsWith("https://uploadthing.com/f/")
      ? `https://utfs.io/f/${resumeUrl.split("/f/")[1]}`
      : resumeUrl;

    // Fetch PDF with improved error handling
    let pdfBuffer: ArrayBuffer;
    try {
      console.log("Fetching PDF from:", normalizedUrl); // Debug log

      const pdfResponse = await fetch(normalizedUrl, {
        headers: {
          Accept: "application/pdf",
          "X-Requested-With": "XMLHttpRequest",
        },
        redirect: "follow",
        cache: "no-cache",
      });

      if (!pdfResponse.ok) {
        console.error(
          "PDF fetch failed:",
          pdfResponse.status,
          await pdfResponse.text()
        );
        throw new Error(`HTTP ${pdfResponse.status}`);
      }

      const contentType = pdfResponse.headers.get("Content-Type");
      if (!contentType?.includes("application/pdf")) {
        console.error("Invalid content type:", contentType);
        throw new Error("Invalid PDF content type");
      }

      pdfBuffer = await pdfResponse.arrayBuffer();

      if (!pdfBuffer || pdfBuffer.byteLength === 0) {
        throw new Error("Empty PDF buffer");
      }
    } catch (error) {
      console.error("PDF fetch error:", error);
      return NextResponse.json(
        {
          error: "Failed to download resume",
          details:
            error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    // Load PDF content with error handling
    let resumeText: string;
    try {
      const loader = new PDFLoader(
        new Blob([pdfBuffer], { type: "application/pdf" }),
        {
          parsedItemSeparator: " ",
          splitPages: false,
        }
      );

      const docs = await loader.load();
      resumeText = docs.map((doc) => doc.pageContent).join("\n");

      if (!resumeText.trim()) {
        return NextResponse.json({
          isValid: false,
          feedback: {
            strengths: [],
            improvements: ["The PDF appears to be empty or unreadable"],
            overallFeedback:
              "Please upload a valid resume PDF file",
          },
          skills: [],
          experience: { years: 0, level: "entry" },
          education: [],
          buzzwords: { count: 0, list: [], warning: false },
          criticalFlaws: [],
          additionalRecommendations: "",
        });
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json({
        isValid: false,
        feedback: {
          strengths: [],
          improvements: ["Failed to parse PDF content"],
          overallFeedback:
            "Please ensure you've uploaded a valid PDF file",
        },
        skills: [],
        experience: { years: 0, level: "entry" },
        education: [],
        buzzwords: { count: 0, list: [], warning: false },
        criticalFlaws: [],
        additionalRecommendations: "",
      });
    }

    // Analyze with Gemini
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `You are a resume analyzer. Your task is to analyze the resume and return ONLY a JSON object with no additional text or explanation. The JSON must follow this exact structure:
{
  "isValid": boolean,
  "feedback": {
    "strengths": string[],
    "improvements": string[],
    "overallFeedback": string
  },
  "skills": string[],
  "experience": {
    "years": number,
    "level": "entry"|"mid"|"senior"
  },
  "education": [{
    "degree": string,
    "institution": string,
    "year": number
  }],
  "buzzwords": {
    "count": number,
    "list": string[],
    "warning": boolean
  },
  "criticalFlaws": string[],
  "additionalRecommendations": string
}

Rules for analysis:
1. ALWAYS provide 3-5 strengths even if the resume needs improvements.
2. Focus on technical skills, experience, and education.
3. Provide actionable improvement suggestions.
4. Analyze the resume for excessive use of buzzwords that might turn off recruiters.
5. Identify any critical flaws in the resume. Critical flaws include: overuse of buzzwords, overlapping engineering jargon, multiple job titles that conflict or confuse, a confusing overall structure, or language that appears shady or unprofessional.
6. Offer additional recommendations for improvement.

Resume text to analyze:
${resumeText.substring(0, 30000)}`;

      const result = await model.generateContent(prompt);
      const analysisText = (await result.response.text()).trim();

      // Improved JSON cleaning
      let cleanedResponse = analysisText
        .replace(/```json\s*/g, "") // Remove JSON code block markers with any whitespace
        .replace(/```\s*/g, "") // Remove any other code block markers
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with straight quotes
        .trim();

      // Find the first { and last } to extract just the JSON object
      const startIndex = cleanedResponse.indexOf("{");
      const endIndex = cleanedResponse.lastIndexOf("}") + 1;

      if (startIndex === -1 || endIndex === 0) {
        throw new Error("No valid JSON object found in response");
      }

      cleanedResponse = cleanedResponse.slice(startIndex, endIndex);

      try {
        const analysis = JSON.parse(cleanedResponse);

        // Convert string years to number if needed
        if (typeof analysis.experience?.years === "string") {
          const yearsStr = analysis.experience.years;
          analysis.experience.years = parseInt(yearsStr.replace("+", ""));
        }

        // Fix education year if it's "20xx"
        if (analysis.education?.length > 0) {
          analysis.education = analysis.education.map((edu: { year: string }) => ({
            ...edu,
            year: edu.year === "20xx" ? new Date().getFullYear() : edu.year,
          }));
        }

        // Validate and ensure all required fields
        const validatedAnalysis = {
          isValid: Boolean(analysis.isValid),
          feedback: {
            strengths: Array.isArray(analysis.feedback?.strengths)
              ? analysis.feedback.strengths
              : [],
            improvements: Array.isArray(analysis.feedback?.improvements)
              ? analysis.feedback.improvements
              : [],
            overallFeedback:
              analysis.feedback?.overallFeedback ||
              "Resume analyzed successfully",
          },
          skills: Array.isArray(analysis.skills) ? analysis.skills : [],
          experience: {
            years:
              typeof analysis.experience?.years === "number"
                ? analysis.experience.years
                : 0,
            level: ["entry", "mid", "senior"].includes(analysis.experience?.level)
              ? analysis.experience.level
              : "entry",
          },
          education: Array.isArray(analysis.education)
            ? analysis.education
            : [],
          buzzwords: {
            count: analysis.buzzwords?.count || 0,
            list: Array.isArray(analysis.buzzwords?.list)
              ? analysis.buzzwords.list
              : [],
            warning: Boolean(analysis.buzzwords?.warning),
          },
          criticalFlaws: Array.isArray(analysis.criticalFlaws)
            ? analysis.criticalFlaws
            : [],
          additionalRecommendations:
            analysis.additionalRecommendations || "",
        };

        return NextResponse.json(validatedAnalysis);
      } catch (error) {
        console.error("JSON parsing error:", error);
        console.error("Cleaned response:", cleanedResponse);
        return NextResponse.json({
          isValid: false,
          feedback: {
            strengths: [],
            improvements: ["Failed to analyze resume content"],
            overallFeedback:
              "Our analysis system encountered an error. Please try again.",
          },
          skills: [],
          experience: { years: 0, level: "entry" },
          education: [],
          buzzwords: { count: 0, list: [], warning: false },
          criticalFlaws: [],
          additionalRecommendations: "",
        });
      }
    } catch (error) {
      console.error("Gemini analysis error:", error);
      return NextResponse.json({
        isValid: false,
        feedback: {
          strengths: [],
          improvements: ["Error analyzing resume content"],
          overallFeedback:
            "Our AI system encountered an error. Please try again later.",
        },
        skills: [],
        experience: { years: 0, level: "entry" },
        education: [],
        buzzwords: { count: 0, list: [], warning: false },
        criticalFlaws: [],
        additionalRecommendations: "",
      });
    }
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json(
      {
        isValid: false,
        feedback: {
          strengths: [],
          improvements: ["Error processing resume"],
          overallFeedback: "Please try again with a different file",
        },
        skills: [],
        experience: { years: 0, level: "entry" },
        education: [],
        buzzwords: { count: 0, list: [], warning: false },
        criticalFlaws: [],
        additionalRecommendations: "",
      },
      { status: 500 }
    );
  }
}
