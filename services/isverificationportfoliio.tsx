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
    console.log('Starting portfolio verification with data:', {
      name: portfolioData.data.basics.name,
      projectCount: portfolioData.data.projects.length,
      skillsCount: portfolioData.data.skills.technical.length
    });

    const prompt = `Analyze this portfolio data and provide a constructive verification:
    Name: ${portfolioData.data.basics.name}
    Title: ${portfolioData.data.basics.title}
    Bio: ${portfolioData.data.basics.bio || 'Not provided'}
    Projects Count: ${portfolioData.data.projects.length}
    Technical Skills: ${portfolioData.data.skills.technical.join(', ') || 'None provided'}
    
    Consider these factors:
    1. Has basic profile information
    2. Has listed technical skills
    3. Has projects showcased
    4. Overall profile completeness: ${portfolioData.analysis.insights.score}%
    
    Return a JSON response with specific verification criteria:
    {
      "isVerified": boolean (true if has name, title, and at least 1 project),
      "message": "Specific feedback with improvements needed",
      "score": number (0-100 based on content completeness)
    }`;

    console.log('Sending prompt to Gemini:', prompt);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log('Raw Gemini response:', response);
    
    const cleanedResponse = response
      .trim()
      .replace(/```json\s*|\s*```/g, '')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '');

      console.log('Cleaned response:', cleanedResponse);
    
    try {
      const analysis = JSON.parse(cleanedResponse);
      
      if (typeof analysis.isVerified !== 'boolean' || 
          typeof analysis.message !== 'string' || 
          typeof analysis.score !== 'number') {
            console.error('Invalid analysis structure:', analysis);
        throw new Error('Invalid response format');
      }

      const result = {
        isVerified: analysis.isVerified,
        message: analysis.message,
        score: analysis.score
      };

      console.log('Final verification result:', result);
      return result;

    } catch (parseError) {
      console.error('JSON parsing error:', {
        error: parseError,
        response: cleanedResponse,
        responseType: typeof cleanedResponse
      });
      throw new Error('Failed to parse AI response');
    }
   
  } catch (error) {
    console.error('Portfolio verification error:', {
      error,
      portfolioData: {
        hasName: !!portfolioData?.data?.basics?.name,
        hasProjects: !!portfolioData?.data?.projects?.length,
        hasSkills: !!portfolioData?.data?.skills?.technical?.length
      }
    });
    return {
      isVerified: false,
      message: "Failed to verify portfolio. Please try again later.",
      score: 0
    };
  }
};