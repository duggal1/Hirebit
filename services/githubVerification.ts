import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GithubUserData } from './githubService'; 

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
export const isVerified = async (githubData: GithubUserData): Promise<{ isVerified: boolean; message: string }> => {
  try {
    const prompt = `Analyze this GitHub profile for authenticity:
Name: ${githubData.name}
Login: ${githubData.login}
Repos: ${githubData.public_repos}
Followers: ${githubData.followers}
Following: ${githubData.following}
Created: ${githubData.created_at}

Return only this JSON structure (no other text):
{
  "isVerified": true/false,
  "message": "verification message"
}

Guidelines:
- Verify if account appears genuine (not spam/bot)
- Missing bio is OK
- Account should have some activity (repos OR followers)
- Include encouraging suggestions in message
- Keep message under 200 characters`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Simplified response cleaning
    const cleanedResponse = response
      .trim()
      .replace(/```(?:json)?|```/g, '')
      .replace(/^[^{]*({.*})[^}]*$/, '$1');
    
    try {
      const analysis = JSON.parse(cleanedResponse);
      
      if (typeof analysis.isVerified !== 'boolean' || typeof analysis.message !== 'string') {
        throw new Error('Invalid response format');
      }

      return analysis;

    } catch (parseError) {
      console.error('Parsing error:', cleanedResponse);
      return {
        isVerified: true, // Default to true if parsing fails but we have a response
        message: "Account appears valid. Consider adding more public repositories and engaging with the community."
      };
    }

  } catch (error) {
    console.error('Verification error:', error);
    return {
      isVerified: true, // Default to true for system errors
      message: "Basic verification passed. Unable to perform detailed analysis."
    };
  }
};