
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyPortfolio } from './isverificationportfoliio';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Simplified interface focusing on key job seeker data
export interface PortfolioInsights {
  data: {
    basics: {
      name: string;
      title: string;
      bio: string;
      location: string;
    };
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      liveUrl?: string;
      sourceUrl?: string;
      highlights: string[];
    }>;
    skills: {
      technical: string[];
      frameworks: string[];
      languages: string[];
    };
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    insights: {
      score: number;
      roleClarity: {
        score: number;
        issues: string[];
        suggestedRole: string;
        titleAnalysis: {
          hasOverload: boolean;
          buzzwordCount: number;
          suggestedTitle: string;
          issues: string[];
        };
      };
      skillProjectMatch: {
        score: number;
        unmatchedSkills: string[];
        missingProjects: string[];
        overexaggeratedClaims: string[];
        recommendations: string[];
      };
      projectQuality: {
        score: number;
        suggestions: string[];
        hasLiveDemo: boolean;
        hasSourceCode: boolean;
      };
      skillsAnalysis: {
        score: number;
        missingCoreSkills: string[];
      };
    };
  };
  verification?: {
    isVerified: boolean;
    message: string;
    score: number;
  };
}

export const fetchPortfolioData = async (url: string): Promise<PortfolioInsights> => {
  try {
    console.log('Fetching portfolio data for:', url);
    const response = await fetch('/api/scrape-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio data: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML fetched, length:', html.length);

    const portfolioData = await analyzeWithGemini(html, url);
    const verification = await verifyPortfolio(portfolioData);
    
    return {
      ...portfolioData,
      verification
    };

  } catch (error) {
    console.error('Portfolio analysis failed:', error);
    return getDefaultAnalysis();
  }
};

async function analyzeWithGemini(html: string, url: string): Promise<PortfolioInsights> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    console.log('Starting initial data extraction...');
    
    const extractionPrompt = `You are a JSON generator analyzing portfolio websites. Your task is to extract information from HTML and return it ONLY as JSON - no explanations or other text.

URL: ${url}

IMPORTANT: 
- Return ONLY valid JSON
- Do not include any other text, markdown, or explanations
- If you can't extract something, use empty strings or arrays
- Never return "I'm sorry" or other messages

Required JSON structure:
{
  "data": {
    "basics": {
      "name": "extracted name or Unknown",
      "title": "role or Not Specified",
      "bio": "bio or No biography available",
      "location": "location or Not Specified"
    },
    "projects": [{
      "title": "project name",
      "description": "description",
      "technologies": ["tech stack"],
      "liveUrl": "demo link or empty string",
      "sourceUrl": "code link or empty string",
      "highlights": ["key achievements"]
    }],
    "skills": {
      "technical": ["skills"],
      "frameworks": ["frameworks"],
      "languages": ["languages"]
    }
  }
}

HTML Content to analyze: ${html.substring(0, 15000)}`;

    const extractionResult = await model.generateContent(extractionPrompt);
    const extractionText = extractionResult.response.text();
    console.log('✅Raw extraction completed. Length:', extractionText.length);

    // Enhanced JSON extraction with better error handling
    let extractedData;
    try {
      const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const cleanedJson = jsonMatch[0]
        .replace(/```json\s*|\s*```/g, '')
        .replace(/^JSON\s*|^\s*{/m, '{')
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .trim();

      extractedData = JSON.parse(cleanedJson);

      if (!extractedData?.data?.basics) {
        throw new Error('Invalid data structure in extraction result');
      }
    } catch (parseError) {
      console.error('❌Failed to parse extraction result:', parseError);
      return getDefaultAnalysis();
    }

    // Enhanced analysis prompt for better JSON response
    const analysisPrompt = `Analyze this portfolio data critically and thoroughly:
  ${JSON.stringify(extractedData, null, 2)}

  Provide a detailed technical analysis with special focus on:
  1. Skill-Project Match Validation:
     - Compare claimed skills against project implementations
     - Flag any skills without supporting project work
     - Identify potential skill exaggerations
     - Validate technical roles against project complexity

  2. Title Clarity Analysis:
     - Check for buzzword overload in job titles
     - Validate role consistency
     - Flag generic or overly broad titles
     - Suggest focused, specific titles

  3. Project Validation:
     - Verify technical depth matches claimed expertise
     - Check for project-skill alignment
     - Validate complexity claims

  Return ONLY valid JSON with this structure:
  {
    "strengths": ["detailed strength points"],
    "weaknesses": ["specific improvement areas"],
    "insights": {
    "score": 0,
    "roleClarity": {
      "score": 0,
      "issues": ["role alignment issues"],
      "suggestedRole": "focused role recommendation",
      "titleAnalysis": {
      "hasBuzzwordOverload": false,
      "buzzwordsFound": [],
      "recommendedTitle": "clear title suggestion",
      "clarity": 0
      }
    },
    "skillProjectMatch": {
      "score": 0,
      "unmatchedSkills": ["skills without project evidence"],
      "missingProjects": ["expected project types"],
      "overclaimedRoles": ["roles without evidence"],
      "recommendations": ["project suggestions"]
    },
    "projectQuality": {
      "score": 0,
      "suggestions": ["specific improvements"],
      "hasLiveDemo": false,
      "hasSourceCode": false
    },
    "skillsAnalysis": {
      "score": 0,
      "missingCoreSkills": ["missing skills"]
    }
    }
  }`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();
    
    let analysisData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in analysis response');
      }

      const cleanedJson = jsonMatch[0]
        .replace(/```(?:json)?\s*|\s*```/g, '')
        .replace(/^JSON\s*|^\s*{/m, '{')
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .trim();

      analysisData = JSON.parse(cleanedJson);

      if (!analysisData?.insights) {
        throw new Error('Invalid analysis data structure');
      }

      // Ensure numeric scores
      analysisData.insights.score = Number(analysisData.insights.score) || 0;
      analysisData.insights.projectQuality.score = Number(analysisData.insights.projectQuality.score) || 0;
      analysisData.insights.skillsAnalysis.score = Number(analysisData.insights.skillsAnalysis.score) || 0;
    } catch (parseError) {
      console.error('Failed to parse analysis result:', parseError);
      return getDefaultAnalysis();
    }

    return {
      data: {
        ...extractedData.data,
        projects: extractedData.data.projects || [],
        skills: extractedData.data.skills || {
          technical: [],
          frameworks: [],
          languages: []
        }
      },
      analysis: analysisData
    };

  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis(): PortfolioInsights {
  return {
    data: {
      basics: {
        name: 'Name not found',
        title: 'Role not specified',
        bio: 'No biography provided',
        location: 'Location not specified'
      },
      projects: [{
        title: 'No projects found',
        description: 'Add projects to showcase your skills',
        technologies: ['Add technologies used'],
        highlights: ['Add project highlights'],
        liveUrl: '',
        sourceUrl: ''
      }],
      skills: {
        technical: ['Add technical skills'],
        frameworks: ['Add frameworks'],
        languages: ['Add programming languages']
      }
    },
    analysis: {
      strengths: ['Taking initiative to create a portfolio'],
      weaknesses: ['Portfolio needs more content'],
      insights: {
        score: 30,
        roleClarity: {
          score: 30,
          issues: ['Role focus needs clarification'],
          suggestedRole: 'Consider specifying your target role',
          titleAnalysis: {
            hasOverload: false,
            buzzwordCount: 0,
            suggestedTitle: 'Role not specified',
            issues: ['Title needs to be defined']
          }
        },
        skillProjectMatch: {
          score: 0,
          unmatchedSkills: ['No skills to analyze'],
          missingProjects: ['No projects found'],
          overexaggeratedClaims: [],
          recommendations: ['Add projects demonstrating your skills']
        },
        projectQuality: {
          score: 0,
          suggestions: ['Add project details'],
          hasLiveDemo: false,
          hasSourceCode: false
        },
        skillsAnalysis: {
          score: 0,
          missingCoreSkills: ['Add your core technical skills']
        }
      }
    }
  };
}
