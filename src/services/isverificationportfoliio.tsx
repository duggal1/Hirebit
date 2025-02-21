import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PortfolioInsights } from './portfolioService';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface VerificationResult {
  isVerified: boolean;
  message: string;
  score: number;
}

export const verifyPortfolio = async (portfolioData: PortfolioInsights): Promise<VerificationResult> => {
  try {
    // Extract key fields
    const { basics, projects, skills } = portfolioData.data;
    const name = basics.name;
    const title = basics.title;
    const bio = basics.bio || 'Not provided';
    const projectsCount = projects.length;
    const technicalSkills = Array.isArray(skills?.technical) ? skills.technical.join(', ') : 'None';

    // A simplified prompt to determine if the portfolio is genuine.
    const prompt = `I have a portfolio with the following details:
Name: ${name}
Title: ${title}
Bio: ${bio}
Projects Count: ${projectsCount}
Technical Skills: ${technicalSkills}

A portfolio is considered genuine if it has a real non-empty name, at least one project, and at least one technical skill. Please verify this portfolio and return a JSON object with the following structure:
{
  "isVerified": boolean,
  "message": string,
  "score": number
}`;
    
    console.log('Sending prompt to Gemini:', prompt);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log('Raw Gemini response:', response);
    
    // Clean up the response for JSON parsing
    const cleanedResponse = response
      .trim()
      .replace(/```json\s*|\s*```/g, '')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '');
    
    console.log('Cleaned response:', cleanedResponse);
    
    const analysis = JSON.parse(cleanedResponse);
    
    // Validate expected fields
    if (
      typeof analysis.isVerified !== 'boolean' ||
      typeof analysis.message !== 'string' ||
      typeof analysis.score !== 'number'
    ) {
      throw new Error('Invalid response format');
    }
    
    console.log('Final verification result:', analysis);
    
    return {
      isVerified: analysis.isVerified,
      message: analysis.message,
      score: analysis.score
    };
    
  } catch (error) {
    console.error('Portfolio verification error:', error);
    return {
      isVerified: false,
      message: "Verification failed due to an error.",
      score: 0
    };
  }
};
