/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeProblem, EvaluationResult } from "@/types/code";
import { RateLimiter } from 'limiter';

const GEMINI_API_KEY = "AIzaSyCwFtO6agPTzedSEA_WKx3E29hKDP_a3b4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Create a rate limiter: 100 requests per minute
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute'
});

// Helper function to convert parsed response to EvaluationResult
function convertToEvaluationResult(response: any): EvaluationResult {
  return {
    score: Number(response.score) || 0,
    executionTime: String(response.executionTime || 'Not provided'),
    memory: String(response.memory || 'Not provided'),
    problemSolvingScore: {
      score: Number(response.problemSolvingScore?.score) || 0,
      approach: String(response.problemSolvingScore?.approach || ''),
      creativity: String(response.problemSolvingScore?.creativity || ''),
      edgeCases: Array.isArray(response.problemSolvingScore?.edgeCases) ? 
        response.problemSolvingScore.edgeCases.map(String) : ['No edge cases identified']
    },
    codeQualityScore: {
      score: Number(response.codeQualityScore?.score) || 0,
      patterns: Array.isArray(response.codeQualityScore?.patterns) ? 
        response.codeQualityScore.patterns.map(String) : ['Basic implementation pattern'],
      strengths: Array.isArray(response.codeQualityScore?.strengths) ? 
        response.codeQualityScore.strengths.map(String) : ['Code is functional'],
      suggestions: Array.isArray(response.codeQualityScore?.suggestions) ? 
        response.codeQualityScore.suggestions.map(String) : ['Consider adding documentation']
    },
    technicalProficiency: {
      score: Number(response.technicalProficiency?.score) || 0,
      advancedFeatures: Array.isArray(response.technicalProficiency?.advancedFeatures) ? 
        response.technicalProficiency.advancedFeatures.map(String) : ['Basic implementation'],
      bestPractices: Array.isArray(response.technicalProficiency?.bestPractices) ? 
        response.technicalProficiency.bestPractices.map(String) : ['Standard coding practices'],
      areasOfExpertise: Array.isArray(response.technicalProficiency?.areasOfExpertise) ? 
        response.technicalProficiency.areasOfExpertise.map(String) : ['Basic programming concepts'],
      improvementAreas: Array.isArray(response.technicalProficiency?.improvementAreas) ? 
        response.technicalProficiency.improvementAreas.map(String) : ['Code organization']
    },
    performanceMetrics: {
      timeComplexity: String(response.performanceMetrics?.timeComplexity || 'O(1)'),
      spaceComplexity: String(response.performanceMetrics?.spaceComplexity || 'O(1)'),
      bottlenecks: Array.isArray(response.performanceMetrics?.bottlenecks) ? 
        response.performanceMetrics.bottlenecks.map(String) : ['No significant bottlenecks'],
      optimizations: Array.isArray(response.performanceMetrics?.optimizations) ? 
        response.performanceMetrics.optimizations.map(String) : ['Code is sufficiently optimized']
    },
    codeAnalysis: {
      strengths: Array.isArray(response.codeAnalysis?.strengths) ? 
        response.codeAnalysis.strengths.map(String) : ['Code is functional'],
      weaknesses: Array.isArray(response.codeAnalysis?.weaknesses) ? 
        response.codeAnalysis.weaknesses.map(String) : ['Could benefit from documentation'],
      bestPractices: Array.isArray(response.codeAnalysis?.bestPractices) ? 
        response.codeAnalysis.bestPractices.map(String) : ['Basic coding standards'],
      improvements: Array.isArray(response.codeAnalysis?.improvements) ? 
        response.codeAnalysis.improvements.map(String) : ['Add documentation']
    },
    securityConsiderations: String(response.securityConsiderations || 'No major security concerns'),
    overallFeedback: String(response.overallFeedback || ''),
    learningResources: Array.isArray(response.learningResources) ? 
      response.learningResources.map(String) : ['Programming fundamentals'],
    realWorldAnalysis: {
      isApplicable: Boolean(response.realWorldAnalysis?.isApplicable),
      applicableProblems: Array.isArray(response.realWorldAnalysis?.applicableProblems) ? 
        response.realWorldAnalysis.applicableProblems.map(String) : ['Basic programming tasks'],
      requiredModifications: Array.isArray(response.realWorldAnalysis?.requiredModifications) ? 
        response.realWorldAnalysis.requiredModifications.map(String) : ['Add error handling'],
      targetIndustries: Array.isArray(response.realWorldAnalysis?.targetIndustries) ? 
        response.realWorldAnalysis.targetIndustries.map(String) : ['Software Development'],
      businessValue: String(response.realWorldAnalysis?.businessValue || 'Educational value')
    },
    productionReadiness: {
      scalabilityScore: Number(response.productionReadiness?.scalabilityScore) || 0,
      infrastructureNeeds: Array.isArray(response.productionReadiness?.infrastructureNeeds) ? 
        response.productionReadiness.infrastructureNeeds.map(String) : ['Basic computing resources'],
      monitoringRequirements: Array.isArray(response.productionReadiness?.monitoringRequirements) ? 
        response.productionReadiness.monitoringRequirements.map(String) : ['Basic error logging'],
      maintenanceNeeds: Array.isArray(response.productionReadiness?.maintenanceNeeds) ? 
        response.productionReadiness.maintenanceNeeds.map(String) : ['Regular code reviews'],
      estimatedCosts: String(response.productionReadiness?.estimatedCosts || 'Minimal costs')
    },
    techStack: {
      frontend: Array.isArray(response.techStack?.frontend) ? 
        response.techStack.frontend.map(String) : [],
      backend: Array.isArray(response.techStack?.backend) ? 
        response.techStack.backend.map(String) : [],
      databases: Array.isArray(response.techStack?.databases) ? 
        response.techStack.databases.map(String) : [],
      tools: Array.isArray(response.techStack?.tools) ? 
        response.techStack.tools.map(String) : [],
      codeHighlights: Array.isArray(response.techStack?.codeHighlights) ? 
        response.techStack.codeHighlights.map(String) : [],
      applicationType: String(response.techStack?.applicationType || 'Not specified'),
      languageUsage: Array.isArray(response.techStack?.languageUsage) ? 
        response.techStack.languageUsage.map(String) : []
    },
    codeQualityMetrics: {
      readabilityScore: Number(response.codeQualityMetrics?.readabilityScore) || 0,
      readabilityAnalysis: String(response.codeQualityMetrics?.readabilityAnalysis || ''),
      maintainabilityScore: Number(response.codeQualityMetrics?.maintainabilityScore) || 0,
      maintainabilityAnalysis: String(response.codeQualityMetrics?.maintainabilityAnalysis || ''),
      consistencyScore: Number(response.codeQualityMetrics?.consistencyScore) || 0,
      consistencyAnalysis: String(response.codeQualityMetrics?.consistencyAnalysis || ''),
      documentationScore: Number(response.codeQualityMetrics?.documentationScore) || 0,
      documentationAnalysis: String(response.codeQualityMetrics?.documentationAnalysis || ''),
      testingScore: Number(response.codeQualityMetrics?.testingScore) || 0,
      testingAnalysis: String(response.codeQualityMetrics?.testingAnalysis || ''),
      qualityAssessments: Array.isArray(response.codeQualityMetrics?.qualityAssessments) ? 
        response.codeQualityMetrics.qualityAssessments.map((assessment: { category: any; score: any; analysis: any; recommendations: any[]; }) => ({
          category: String(assessment.category || ''),
          score: Number(assessment.score) || 0,
          analysis: String(assessment.analysis || ''),
          recommendations: Array.isArray(assessment.recommendations) ? 
            assessment.recommendations.map(String) : []
        })) : []
    }
  };
}
function getDefaultEvaluationResult(): EvaluationResult {
  return {
    score: 0,
    executionTime: 'Not provided',
    memory: 'Not provided',
    problemSolvingScore: {
      score: 0,
      approach: "Error analyzing code",
      creativity: "Error analyzing code",
      edgeCases: []
    },
    codeQualityScore: {
      score: 0,
      patterns: ["Basic pattern"],
      strengths: ["None identified"],
      suggestions: ["Add documentation"]
    },
    technicalProficiency: {
      score: 0,
      advancedFeatures: ["None identified"],
      bestPractices: ["Basic practices"],
      areasOfExpertise: ["Basic programming"],
      improvementAreas: ["Code organization"]
    },
    performanceMetrics: {
      timeComplexity: "Not analyzed",
      spaceComplexity: "Not analyzed",
      bottlenecks: ["Not analyzed"],
      optimizations: ["Not analyzed"]
    },
    codeAnalysis: {
      strengths: ["Unable to analyze code at this time"],
      weaknesses: ["Not analyzed"],
      bestPractices: ["Not analyzed"],
      improvements: ["Not analyzed"]
    },
    securityConsiderations: "No analysis performed",
    overallFeedback: "An error occurred while analyzing the code. Please try again.",
    learningResources: ["Basic programming concepts"],
    realWorldAnalysis: {
      isApplicable: false,
      applicableProblems: ["Not analyzed"],
      requiredModifications: ["Not analyzed"],
      targetIndustries: ["Not applicable"],
      businessValue: "Not analyzed"
    },
    productionReadiness: {
      scalabilityScore: 0,
      infrastructureNeeds: ["Not analyzed"],
      monitoringRequirements: ["Not analyzed"],
      maintenanceNeeds: ["Not analyzed"],
      estimatedCosts: "Not analyzed"
    },
    techStack: {
      frontend: [],
      backend: [],
      databases: [],
      tools: [],
      codeHighlights: [],
      applicationType: "Not specified",
      languageUsage: []
    },
    codeQualityMetrics: {
      readabilityScore: 0,
      readabilityAnalysis: "Not analyzed",
      maintainabilityScore: 0,
      maintainabilityAnalysis: "Not analyzed",
      consistencyScore: 0,
      consistencyAnalysis: "Not analyzed",
      documentationScore: 0,
      documentationAnalysis: "Not analyzed",
      testingScore: 0,
      testingAnalysis: "Not analyzed",
      qualityAssessments: [
        {
          category: "Code Structure",
          score: 0,
          analysis: "Not analyzed",
          recommendations: ["Improve code structure"]
        },
        {
          category: "Documentation",
          score: 0,
          analysis: "Not analyzed",
          recommendations: ["Add documentation"]
        },
        {
          category: "Testing",
          score: 0,
          analysis: "Not analyzed",
          recommendations: ["Add tests"]
        }
      ]
    }
  };
}

export async function evaluateCode(code: string, problem: CodeProblem): Promise<EvaluationResult> {
  if (!code || code.trim() === '') {
    throw new Error("No code submitted for evaluation");
  }

  try {
    // Wait for rate limiter
    await limiter.removeTokens(1);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const evaluatePrompt = `You are an expert code evaluator. Analyze the following code and provide a detailed evaluation in JSON format. Include:

1. Overall score (0-100)
2. Problem-solving approach
3. Code quality metrics
4. Technical proficiency 
5. Performance analysis
6. Security considerations
7. Detailed feedback

Important:
- Never return empty arrays or null values. If a section doesn't have items, provide relevant alternatives or suggestions.
- For techStack, always include:
  * Programming languages used with percentage (e.g. "Python: 80%, JavaScript: 20%")
  * Application type (e.g. "Calculator", "Web App", "API Service", etc.)
  * Frontend frameworks/libraries if applicable
  * Backend technologies if applicable
  * Development tools used
  * Code architecture/patterns used
- For codeQualityMetrics, always provide 3 detailed quality assessments with scores and analysis
- For realWorldAnalysis, always suggest potential real-world applications even for basic programs

Here's the code to evaluate:
${code}

Respond in this exact JSON format:
{
  "score": number,
  "executionTime": number,
  "memory": number,
  "problemSolvingScore": {
    "score": number,
    "approach": string,
    "creativity": string,
    "edgeCases": [string] // At least 1 item
  },
  "codeQualityScore": {
    "score": number,
    "patterns": [string], // At least 1 item
    "strengths": [string], // At least 2 items
    "suggestions": [string] // At least 2 items
  },
  "technicalProficiency": {
    "score": number,
    "advancedFeatures": [string], // At least 1 item or alternative
    "bestPractices": [string], // At least 1 item
    "areasOfExpertise": [string], // At least 1 item
    "improvementAreas": [string] // At least 1 item
  },
  "performanceMetrics": {
    "timeComplexity": string,
    "spaceComplexity": string,
    "bottlenecks": [string], // At least 1 item or "No significant bottlenecks"
    "optimizations": [string] // At least 1 suggestion
  },
  "codeAnalysis": {
    "strengths": [string], // At least 2 items
    "weaknesses": [string], // At least 2 items
    "bestPractices": [string], // At least 1 item
    "improvements": [string] // At least 2 items
  },
  "securityConsiderations": [string], // At least "No major security concerns" if none
  "overallFeedback": string,
  "learningResources": [string], // At least 2 items
  "realWorldAnalysis": {
    "isApplicable": boolean,
    "applicableProblems": [string], // At least 1 item
    "requiredModifications": [string], // At least 1 item
    "targetIndustries": [string], // At least 1 item
    "businessValue": string // Never null
  },
  "productionReadiness": {
    "scalabilityScore": number,
    "infrastructureNeeds": [string], // At least 1 item
    "monitoringRequirements": [string], // At least 1 item
    "maintenanceNeeds": [string], // At least 1 item
    "estimatedCosts": string // Never null, provide estimate or explanation
  },
  "techStack": {
    "frontend": [string], // At least ["Not applicable"] if none
    "backend": [string], // At least 1 item with language %
    "databases": [string], // At least ["No database required"] if none
    "tools": [string], // At least 1 development tool
    "codeHighlights": [string], // At least 1 item
    "applicationType": string, // Type of application
    "languageUsage": [string] // Languages with percentages
  },
  "codeQualityMetrics": {
    "readabilityScore": number,
    "readabilityAnalysis": string,
    "maintainabilityScore": number,
    "maintainabilityAnalysis": string,
    "consistencyScore": number,
    "consistencyAnalysis": string,
    "documentationScore": number,
    "documentationAnalysis": string,
    "testingScore": number,
    "testingAnalysis": string,
    "qualityAssessments": [ // Always include 3 detailed assessments
      {
        "category": string,
        "score": number,
        "analysis": string,
        "recommendations": [string]
      },
      {
        "category": string,
        "score": number,
        "analysis": string,
        "recommendations": [string]
      },
      {
        "category": string,
        "score": number,
        "analysis": string,
        "recommendations": [string]
      }
    ]
  }
}`;

    const result = await model.generateContent(evaluatePrompt);
    const response = await result.response;
    const rawResponse = response.text();
    
    console.log('Raw response:', rawResponse);

    // Helper function to clean and parse JSON
    const cleanAndParseJSON = (jsonStr: string, aggressive = false) => {
      let cleaned = jsonStr;

      // Basic cleanup
      cleaned = cleaned
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      // Extract JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Handle code blocks with backticks
      cleaned = cleaned.replace(/`([^`]*)`/g, (match, code) => {
        // Escape newlines and quotes in code blocks
        return JSON.stringify(code.replace(/\n/g, '\\n').replace(/"/g, '\\"'));
      });

      if (aggressive) {
        // More aggressive cleaning
        cleaned = cleaned
          // Fix unquoted property names
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          // Fix single quotes
          .replace(/:\s*'([^']*?)'\s*(,|})/g, ':"$1"$2')
          // Fix escaped quotes
          .replace(/\\\\/g, '\\')
          .replace(/\\"/g, '\\"')
          // Fix trailing commas in objects
          .replace(/,(\s*})/g, '$1')
          // Fix trailing commas in arrays
          .replace(/,(\s*\])/g, '$1')
          // Fix missing quotes around values
          .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}\]])/g, ':"$1"$2')
          // Fix line breaks and multiple spaces in string values
          .replace(/:\s*"([^"]*?)"\s*(,|})/g, (match, p1, p2) => {
            const cleaned = p1.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
            return `:"${cleaned}"${p2}`;
          });
      }

      // Remove any remaining invalid characters
      cleaned = cleaned.replace(/[^\x20-\x7E\s]/g, '');

      // Fix any remaining syntax issues
      try {
        // Parse to validate
        JSON.parse(cleaned);
        return cleaned;
      } catch (e) {
        // Additional fixes for common issues
        cleaned = cleaned
          // Fix missing quotes around property names
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
          // Fix missing commas between array elements
          .replace(/}(\s*){/g, '},\n{')
          .replace(/](\s*)\[/g, '],\n[')
          // Fix missing quotes around string values
          .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}\]])/g, ':"$1"$2');
        
        return cleaned;
      }
    };

    try {
      // First try with minimal cleaning
      const cleanedRaw = cleanAndParseJSON(rawResponse, false);
      console.log('Attempting to parse with minimal cleaning');
      const parsedResponse = JSON.parse(cleanedRaw);
      console.log('Successfully parsed with minimal cleaning');
      return convertToEvaluationResult(parsedResponse);
    } catch (rawError) {
      console.error('Failed minimal cleaning parse:', rawError);
      
      try {
        // Try with aggressive cleaning
        const cleanedResponse = cleanAndParseJSON(rawResponse, true);
        console.log('Attempting to parse with aggressive cleaning');
        const parsedResponse = JSON.parse(cleanedResponse);
        console.log('Successfully parsed with aggressive cleaning');
        return convertToEvaluationResult(parsedResponse);
      } catch (cleanError) {
        console.error('Failed aggressive cleaning parse:', cleanError);
        
        // If both attempts fail, try one last time with manual fixes
        try {
          // Extract just the valid JSON parts
          const jsonParts = rawResponse.match(/\{[^{}]*\}/g);
          if (jsonParts && jsonParts.length > 0) {
            // Take the largest valid JSON object
            const validJSON = jsonParts
              .sort((a, b) => b.length - a.length)[0]
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ');
            
            console.log('Attempting to parse extracted JSON part');
            const parsedResponse = JSON.parse(validJSON);
            console.log('Successfully parsed extracted JSON');
            return convertToEvaluationResult(parsedResponse);
          }
        } catch (finalError) {
          console.error('All parsing attempts failed');
          console.error('Raw parse error:', rawError);
          console.error('Clean parse error:', cleanError);
          console.error('Final parse error:', finalError);
          return getDefaultEvaluationResult();
        }
        
        return getDefaultEvaluationResult();
      }
    }
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}

export async function generateQuestion(): Promise<CodeProblem> {
  try {
    // Wait for rate limiter
    await limiter.removeTokens(1);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate an extremely challenging coding question about distributed systems or modern web architecture.
    Return ONLY a valid JSON object with NO comments, NO markdown, NO urls, and NO special characters in strings.
    
    The JSON must have this structure:
    {
      "id": "<unique id>",
      "title": "<title>",
      "description": "<description>",
      "difficulty": "Expert",
      "timeLimit": 3600,
      "testCases": [
        {
          "input": "<input>",
          "expectedOutput": "<output>"
        }
      ],
      "constraints": ["<list>"],
      "examples": [
        {
          "input": "<input>",
          "output": "<output>",
          "explanation": "<explanation>"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawResponse = response.text();
    
    console.log('Raw response:', rawResponse);

    // Helper function to clean and parse JSON
    const cleanAndParseJSON = (jsonStr: string, aggressive = false) => {
      let cleaned = jsonStr;

      // Basic cleanup
      cleaned = cleaned
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      // Extract JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Handle code blocks with backticks
      cleaned = cleaned.replace(/`([^`]*)`/g, (match, code) => {
        // Escape newlines and quotes in code blocks
        return JSON.stringify(code.replace(/\n/g, '\\n').replace(/"/g, '\\"'));
      });

      if (aggressive) {
        // More aggressive cleaning
        cleaned = cleaned
          // Fix unquoted property names
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          // Fix single quotes
          .replace(/:\s*'([^']*?)'\s*(,|})/g, ':"$1"$2')
          // Fix escaped quotes
          .replace(/\\\\/g, '\\')
          .replace(/\\"/g, '\\"')
          // Fix trailing commas in objects
          .replace(/,(\s*})/g, '$1')
          // Fix trailing commas in arrays
          .replace(/,(\s*\])/g, '$1')
          // Fix missing quotes around values
          .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}\]])/g, ':"$1"$2')
          // Fix line breaks and multiple spaces in string values
          .replace(/:\s*"([^"]*?)"\s*(,|})/g, (match, p1, p2) => {
            const cleaned = p1.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
            return `:"${cleaned}"${p2}`;
          });
      }

      // Remove any remaining invalid characters
      cleaned = cleaned.replace(/[^\x20-\x7E\s]/g, '');

      // Fix any remaining syntax issues
      try {
        // Parse to validate
        JSON.parse(cleaned);
        return cleaned;
      } catch (e) {
        // Additional fixes for common issues
        cleaned = cleaned
          // Fix missing quotes around property names
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
          // Fix missing commas between array elements
          .replace(/}(\s*){/g, '},\n{')
          .replace(/](\s*)\[/g, '],\n[')
          // Fix missing quotes around string values
          .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}\]])/g, ':"$1"$2');
        
        return cleaned;
      }
    };

    try {
      // First try with minimal cleaning
      const cleanedRaw = cleanAndParseJSON(rawResponse, false);
      console.log('Attempting to parse with minimal cleaning');
      const parsedResponse = JSON.parse(cleanedRaw);
      console.log('Successfully parsed with minimal cleaning');
      return {
        id: String(parsedResponse.id || ''),
        title: String(parsedResponse.title || ''),
        description: String(parsedResponse.description || ''),
        difficulty: String(parsedResponse.difficulty || 'Expert'),
        timeLimit: Number(parsedResponse.timeLimit) || 3600,
        testCases: Array.isArray(parsedResponse.testCases) ? 
          parsedResponse.testCases.map((testCase: { input: any; expectedOutput: any; }) => ({
            input: String(testCase.input || ''),
            expectedOutput: String(testCase.expectedOutput || '')
          })) : [],
        constraints: Array.isArray(parsedResponse.constraints) ? 
          parsedResponse.constraints.map(String) : [],
        examples: Array.isArray(parsedResponse.examples) ? 
          parsedResponse.examples.map((example: { input: any; output: any; explanation: any; }) => ({
            input: String(example.input || ''),
            output: String(example.output || ''),
            explanation: String(example.explanation || '')
          })) : []
      };
    } catch (rawError) {
      console.error('Failed minimal cleaning parse:', rawError);
      
      try {
        // Try with aggressive cleaning
        const cleanedResponse = cleanAndParseJSON(rawResponse, true);
        console.log('Attempting to parse with aggressive cleaning');
        const parsedResponse = JSON.parse(cleanedResponse);
        console.log('Successfully parsed with aggressive cleaning');
        return {
          id: String(parsedResponse.id || ''),
          title: String(parsedResponse.title || ''),
          description: String(parsedResponse.description || ''),
          difficulty: String(parsedResponse.difficulty || 'Expert'),
          timeLimit: Number(parsedResponse.timeLimit) || 3600,
          testCases: Array.isArray(parsedResponse.testCases) ? 
            parsedResponse.testCases.map((testCase: { input: any; expectedOutput: any; }) => ({
              input: String(testCase.input || ''),
              expectedOutput: String(testCase.expectedOutput || '')
            })) : [],
          constraints: Array.isArray(parsedResponse.constraints) ? 
            parsedResponse.constraints.map(String) : [],
          examples: Array.isArray(parsedResponse.examples) ? 
            parsedResponse.examples.map((example: { input: any; output: any; explanation: any; }) => ({
              input: String(example.input || ''),
              output: String(example.output || ''),
              explanation: String(example.explanation || '')
            })) : []
        };
      } catch (cleanError) {
        console.error('Failed aggressive cleaning parse:', cleanError);
        
        // If both attempts fail, try one last time with manual fixes
        try {
          // Extract just the valid JSON parts
          const jsonParts = rawResponse.match(/\{[^{}]*\}/g);
          if (jsonParts && jsonParts.length > 0) {
            // Take the largest valid JSON object
            const validJSON = jsonParts
              .sort((a, b) => b.length - a.length)[0]
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ');
            
            console.log('Attempting to parse extracted JSON part');
            const parsedResponse = JSON.parse(validJSON);
            console.log('Successfully parsed extracted JSON');
            return {
              id: String(parsedResponse.id || ''),
              title: String(parsedResponse.title || ''),
              description: String(parsedResponse.description || ''),
              difficulty: String(parsedResponse.difficulty || 'Expert'),
              timeLimit: Number(parsedResponse.timeLimit) || 3600,
              testCases: Array.isArray(parsedResponse.testCases) ? 
                parsedResponse.testCases.map((testCase: { input: any; expectedOutput: any; }) => ({
                  input: String(testCase.input || ''),
                  expectedOutput: String(testCase.expectedOutput || '')
                })) : [],
              constraints: Array.isArray(parsedResponse.constraints) ? 
                parsedResponse.constraints.map(String) : [],
              examples: Array.isArray(parsedResponse.examples) ? 
                parsedResponse.examples.map((example: { input: any; output: any; explanation: any; }) => ({
                  input: String(example.input || ''),
                  output: String(example.output || ''),
                  explanation: String(example.explanation || '')
                })) : []
            };
          }
        } catch (finalError) {
          console.error('All parsing attempts failed');
          console.error('Raw parse error:', rawError);
          console.error('Clean parse error:', cleanError);
          console.error('Final parse error:', finalError);
          throw new Error("Failed to generate question. Please try again.");
        }
        
     // Replace the return getDefaultEvaluationResult(); line with this:
     return {
      id: 'default-question',
      title: 'Default Question',
      description: 'Failed to generate a question. Please try again.',
      difficulty: 'Expert',
      timeLimit: 3600,
      testCases: [{
        input: 'default input',
        expectedOutput: 'default output'
      }],
      constraints: ['Please try generating a new question'],
      examples: [{
        input: 'example input',
        output: 'example output',
        explanation: 'Default example'
      }]
    };
      }
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}
