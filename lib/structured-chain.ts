import { BaseMessageChunk } from "@langchain/core/messages";
import { ZodSchema } from "zod";

export async function createStructuredOutput<T>(
  schema: ZodSchema<T>,
  llm: any,
  input: string
): Promise<T> {
  try {
    const result = await llm.invoke(input);
    
    // Handle different response formats
    const message = result?.message ?? result?.lc_kwargs?.content;
    
    if (!message) {
      throw new Error("Invalid LLM response format - missing message");
    }

    const jsonString = typeof message === "string" ? message : message.content;
    
    // Clean JSON response
    const cleanedJson = jsonString
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return schema.parse(JSON.parse(cleanedJson));
  } catch (error) {
    console.error("Structured output error:", error);
    throw new Error(`Failed to process job requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 