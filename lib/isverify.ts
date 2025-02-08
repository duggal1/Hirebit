
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const analyzeGithubUser = async (username: string): Promise<{ isValid: boolean; message: string }> => {
    const prompt = `Analyze the GitHub user: "${username}". Determine if this user appears to be real and valid. Return a JSON object with the following fields: { "isValid": boolean, "message": string }`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        const cleanedResponse = response.trim().replace(/^```json\n|\n```$/g, '');
        const analysis = JSON.parse(cleanedResponse);

        return {
            isValid: analysis.isValid,
            message: analysis.message || "No specific message provided."
        };
    } catch (error) {
        console.error('Error analyzing GitHub user:', error);
        return {
            isValid: false,
            message: "Failed to analyze GitHub user."
        };
    }
};