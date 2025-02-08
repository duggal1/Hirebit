import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GithubUserData } from './githubService'; 

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const isVerified = async (githubData: GithubUserData): Promise<{ isVerified: boolean; message: string }> => {
  try {
    const prompt = `Analyze the following GitHub user data to determine if the user is real and valid: 
    Name: ${githubData.name},
    Login: ${githubData.login}, 
   
    Public Repositories: ${githubData.public_repos}, 
    Followers: ${githubData.followers}, 
    Following: ${githubData.following},
    Bio: ${githubData.bio}, 
    Account Created: ${githubData.created_at}

    Consider these factors:
    1. Profile completeness
    2. Account activity
    3. Account age
    4. Follow/Following ratio

    Respond ONLY with a valid JSON object. If verified, use the message "Successfully verified " and generate more about the user like give suggestion like if user has no bio so tell and if user have then tell how to imporve it as and appreactie user on based on follower aif user have impressive followers . If not verified, provide a brief reason why.
    Format: {"isVerified": true/false, "message": "message here"}`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Clean the response string
    const cleanedResponse = response
      .trim()
      .replace(/```json\s*|\s*```/g, '') // Remove markdown code blocks
      .replace(/[\u201C\u201D]/g, '"')   // Replace smart quotes
      .replace(/^[^{]*/, '')             // Remove any text before the first {
      .replace(/[^}]*$/, '');            // Remove any text after the last }
    
    try {
      const analysis = JSON.parse(cleanedResponse);
      
      // Validate the parsed response has the required fields
      if (typeof analysis.isVerified !== 'boolean' || typeof analysis.message !== 'string') {
        throw new Error('Invalid response format');
      }

      return {
        isVerified: analysis.isVerified,
        message: analysis.message
      };
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Response:', cleanedResponse);
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('GitHub verification error:', error);
    return {
      isVerified: false,
      message: "Failed to verify GitHub user. Please try again later."
    };
  }
};