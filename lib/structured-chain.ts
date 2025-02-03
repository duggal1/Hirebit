import { BaseMessageChunk } from "@langchain/core/messages";
import { ZodSchema } from "zod";

export async function createStructuredOutput<T>(
  schema: ZodSchema<T>,
  output: string,
  input: string
): Promise<T> {
  try {
    // Clean and parse JSON response
    const cleanedJson = output
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^[\s\n]*\{/, '{')
      .replace(/\}[\s\n]*$/, '}')
      .replace(/\n/g, ' ')
      .trim();

    try {
      const parsedJson = JSON.parse(cleanedJson);
      
      // Ensure numbers are properly formatted
      if (parsedJson.experience?.years) {
        parsedJson.experience.years = Number(parsedJson.experience.years);
      }
      
      // Ensure arrays are properly formatted
      ['technical_skills', 'performance_metrics'].forEach(field => {
        if (parsedJson[field] && !Array.isArray(parsedJson[field])) {
          parsedJson[field] = [parsedJson[field]];
        }
      });
      
      if (parsedJson.technical_requirements) {
        ['languages', 'frameworks', 'tools'].forEach(field => {
          if (parsedJson.technical_requirements[field] && !Array.isArray(parsedJson.technical_requirements[field])) {
            parsedJson.technical_requirements[field] = [parsedJson.technical_requirements[field]];
          }
        });
      }

      return schema.parse(parsedJson);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "\nCleaned JSON:", cleanedJson);
      throw new Error("Failed to parse LLM response as JSON");
    }
  } catch (error) {
    console.error("Structured output error:", error);
    throw new Error(`Failed to process job requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 