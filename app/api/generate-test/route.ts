import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TestQuestion {
  question: string;
  starterCode: string;
  testCases: { input: string; output: string }[];
  difficulty: string;
  skillsTested: string[];
  realTimeHints: string[];
}

interface TestCase {
  input: string;
  output: string;
}

interface GeneratedTestCase {
  input: string;
  expected_output: string;
  explanation: string;
}

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, analyze the job description to identify required skills
    const analysisPrompt = `Analyze this job description and extract:
1. Primary programming languages
2. Frameworks and technologies
3. Type of role (frontend, backend, full-stack, etc.)
4. Key technical skills required
5. Main job responsibilities

Job Description:
${jobDescription}

Return the analysis in this JSON format (no markdown):
{
  "primaryLanguages": ["language1", "language2"],
  "frameworks": ["framework1", "framework2"],
  "roleType": "backend|frontend|fullstack|etc",
  "keySkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"]
}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = (await analysisResult.response.text()).trim();
    
    let jobAnalysis;
    try {
      jobAnalysis = JSON.parse(analysisText.replace(/```json\s*|\s*```/g, '').trim());
    } catch (error) {
      console.error('Job analysis error:', error);
      throw new Error("Failed to analyze job requirements");
    }

    // Now generate appropriate test based on the analysis
    const testPrompt = `Generate a production-grade coding test with:

Job Analysis: ${JSON.stringify(jobAnalysis, null, 2)}

Requirements:
1. Minimum 3 interconnected components
2. Real-world data from ${jobAnalysis.domains[0] || "the JD's industry"}
3. Performance constraints (≤100ms latency for 90% requests)
4. Error handling for ${jobAnalysis.technical.infra[0] || "cloud"} failures
5. Observability requirements

Include these HARD elements:
- Race condition prevention
- Memory leak avoidance
- Horizontal scaling considerations
- Security best practices for ${jobAnalysis.technical.coreLanguages[0]}

Return JSON with:
{
  "questions": [{
    "productionScenario": "detailed real-world situation",
    "technicalRequirements": ["specific technical demands"],
    "performanceThresholds": {
      "maxCpu": "2 cores",
      "maxMemory": "500MB",
      "throughput": "1000 req/sec"
    },
    "debuggingSection": {
      "preWrittenCode": "code with subtle bugs",
      "knownIssues": 3,
      "failureScenarios": ["high load", "network partitions"]
    },
    "submissionArtifacts": [
      "solution.md with architectural decisions",
      "load-test.results.json",
      "monitoring-dashboard.png"
    ]
  }]
}`;

    const result = await model.generateContent(testPrompt);
    const text = (await result.response.text()).trim();
    
    // Clean the response
    let cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^python\s+/i, '')
      .trim();

    cleaned = cleaned.replace(/`\n?([\s\S]*?)\n?`/g, function(match, code) {
      return JSON.stringify(code.trim()).slice(1, -1);
    });

    try {
      const testData = JSON.parse(cleaned);

      if (!Array.isArray(testData.questions) || !testData.questions.length) {
        throw new Error("Invalid test format: missing questions array");
      }

      // Validate questions match job requirements
      const jobSkills = [
        ...jobAnalysis.primaryLanguages,
        ...jobAnalysis.frameworks,
        ...jobAnalysis.keySkills
      ].map(s => s.toLowerCase());

      const hasRelevantQuestions = testData.questions.some((q: any) => {
        const questionText = q.question.toLowerCase();
        const testedSkills = q.skillsTested.map((s: string) => s.toLowerCase());
        return jobSkills.some(skill => 
          questionText.includes(skill) || testedSkills.includes(skill)
        );
      });

      if (!hasRelevantQuestions) {
        throw new Error("Generated questions don't match job requirements");
      }

      // Normalize and validate the data
      const validatedTestData = {
        problem_statement: String(testData.problem_statement || "").trim(),
        requirements: {
          functional: Array.isArray(testData.requirements?.functional) 
            ? testData.requirements.functional.map(String)
            : [],
          technical: Array.isArray(testData.requirements?.technical) 
            ? testData.requirements.technical.map(String)
            : jobAnalysis.keySkills,
          constraints: Array.isArray(testData.requirements?.constraints) 
            ? testData.requirements.constraints.map(String)
            : []
        },
        starter_code: typeof testData.starter_code === 'object'
          ? JSON.stringify(testData.starter_code, null, 2)
          : String(testData.starter_code || "// Code here").trim(),
        test_cases: Array.isArray(testData.test_cases) 
          ? testData.test_cases.map((tc: GeneratedTestCase) => ({
              input: String(tc.input || "")
                .trim()
                .replace(/"/g, '\\"'),
              expected_output: String(tc.expected_output || "")
                .trim()
                .replace(/"/g, '\\"'),
              explanation: String(tc.explanation || "")
                .trim()
                .replace(/"/g, '\\"')
            }))
          : [],
        evaluation_criteria: {
          code_quality: Number(testData.evaluation_criteria?.code_quality || 30),
          performance: Number(testData.evaluation_criteria?.performance || 25),
          architecture: Number(testData.evaluation_criteria?.architecture || 20),
          testing: Number(testData.evaluation_criteria?.testing || 15),
          documentation: Number(testData.evaluation_criteria?.documentation || 10)
        }
      };

      return NextResponse.json(validatedTestData);
    } catch (error) {
      console.error('Test generation error:', error);
      console.error('Raw response:', text);
      console.error('Cleaned JSON:', cleaned);
      
      return NextResponse.json(
        { error: "Failed to generate valid test format" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}