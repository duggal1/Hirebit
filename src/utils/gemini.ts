import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY  || '');

// Initialize the model with specific configuration
const model = genAI.getGenerativeModel({ 
	model: "gemini-2.0-flash",
	generationConfig: {
		temperature: 0.7,
		topK: 40,
		topP: 0.95,
		maxOutputTokens: 2048,
	},
});

export async function getGeminiGeneratedContent(prompt: string): Promise<string> {
	try {
		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error('Error generating content with Gemini:', error);
		throw new Error('Failed to generate content with Gemini');
	}
}