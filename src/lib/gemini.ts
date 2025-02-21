// app/lib/gemini-ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeData } from "./resume-validator";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SECTION_TEMPLATES = {
  workExperience: `Generate professional work experience entries. Follow this JSON format exactly:
  [{
    "position": "Job Title (standard industry title)",
    "company": "Company Name",
    "startDate": "YYYY-MM (e.g., 2020-01)",
    "endDate": "YYYY-MM or null for current positions",
    "highlights": [
      "Achievement with quantifiable results",
      "Technical implementation details",
      "Leadership or team contributions"
    ],
    "location": "City, Country (optional)"
  }]`,

  projects: `Generate technical project entries. Follow this JSON format exactly:
  [{
    "name": "Project Name",
    "description": "Clear project overview",
    "url": "Project URL or null",
    "technologies": ["Main technologies used"],
    "highlights": [
      "Technical implementation details",
      "Project impact or results",
      "Key features or innovations"
    ]
  }]`,

  personalInfo: `Generate professional personal information. Follow this JSON format exactly:
  {
    "fullName": "Full Name",
    "email": "professional.email@example.com",
    "location": "City, Country",
    "portfolio": "Portfolio URL or null",
    "github": "GitHub URL or null",
    "linkedin": "LinkedIn URL or null"
  }`
};

// Helper function to validate and format dates
const validateAndFormatDate = (obj: any) => {
  if (obj.startDate) {
    // Ensure date is in YYYY-MM format
    const match = obj.startDate.match(/^(\d{4})-(\d{2})/);
    if (match) {
      obj.startDate = `${match[1]}-${match[2]}`;
    } else {
      // If not in correct format, use current date
      const now = new Date();
      obj.startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  if (obj.endDate && obj.endDate !== 'null') {
    const match = obj.endDate.match(/^(\d{4})-(\d{2})/);
    if (match) {
      obj.endDate = `${match[1]}-${match[2]}`;
    } else {
      obj.endDate = null;
    }
  } else {
    obj.endDate = null;
  }

  return obj;
};

export async function generateResumeContent(
  section: keyof typeof SECTION_TEMPLATES,
  prompt: string
): Promise<any> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      maxOutputTokens: 1024
    }
  });

  try {
    const result = await model.generateContent([
      { text: SECTION_TEMPLATES[section] },
      { text: `Based on this input, generate appropriate content: ${prompt}` },
      { text: "Respond ONLY with valid JSON matching the exact format above. Ensure dates are in YYYY-MM format." }
    ]);

    const response = result.response.text();
    
    // Clean and parse the response
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);
      
      // Process dates for work experience
      if (section === 'workExperience') {
        return Array.isArray(parsed) 
          ? parsed.map(validateAndFormatDate)
          : [validateAndFormatDate(parsed)];
      }
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function enhanceResumeContent(
  section: keyof typeof SECTION_TEMPLATES,
  content: any
): Promise<any> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.6,
      topP: 0.8,
      maxOutputTokens: 1024
    }
  });

  try {
    const result = await model.generateContent([
      { text: SECTION_TEMPLATES[section] },
      { text: `Enhance this content while maintaining the exact format: ${JSON.stringify(content)}` },
      { text: "Make improvements to wording, add quantifiable achievements, and ensure professional tone." },
      { text: "Respond ONLY with valid JSON matching the exact format above." }
    ]);

    const response = result.response.text();
    
    // Clean and parse the response
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/{\s*"0":\s*/, '[')  // Fix array start
      .replace(/\s*}\s*$/, ']')     // Fix array end
      .replace(/}\s*,\s*{\s*"1":\s*/, ',') // Fix array element separation
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);
      // Ensure we always return an array for work experience and projects
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return content; // Fallback to original content if parsing fails
    }
  } catch (error) {
    console.error('Gemini Enhancement Error:', error);
    return content; // Fallback to original content if API fails
  }
}