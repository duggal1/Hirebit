import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');



export const fetchPortfolioData = async (url: string): Promise<PortfolioInsights > => {
  try {
    // 1. Fetch HTML using the scraping endpoint
    const response = await fetch('/api/scrape-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data');
    }

    const html = await response.text();

    return analyzeWithGemini(html, url);
  } catch (error) {
    console.error('Portfolio analysis failed:', error);
    return getDefaultAnalysis();
  }
};


interface PortfolioInsights {
  data: {
    basics: {
      name: string;
      title: string;
      location: string;
      bio: string;
      roles: string[];
    };
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      liveUrl?: string;
      sourceUrl?: string;
    }>;
    skills: {
      technical: string[];
      softSkills: string[];
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
      };
      projectQuality: {
        score: number;
        issues: string[];
        suggestions: string[];
        hasLiveDemo: boolean;
        hasSourceCode: boolean;
      };
      bioAnalysis: {
        isOptimal: boolean;
        wordCount: number;
        issues: string[];
        suggestions: string[];
      };
      skillsAnalysis: {
        focusScore: number;
        issues: string[];
        redundantSkills: string[];
        missingCoreSkills: string[];
      };
      contentIssues: {
        buzzwords: string[];
        overusedTerms: string[];
        spamKeywords: string[];
        overclaimedSkills: string[];
      };
      criticalFlags: {
        noProjects: boolean;
        multipleRoles: boolean;
        inconsistentInfo: boolean;
        outdatedTech: boolean;
        poorPresentation: boolean;
      };
      improvements: string[];
    };
  };
}


async function analyzeWithGemini(html: string, url: string): Promise<PortfolioInsights> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    // First pass: Extract raw data
    const extractionPrompt = `Analyze this portfolio website HTML and return a JSON object with extracted information:
${url}

Return only valid JSON matching this structure:
{
  "basics": {
    "name": "",
    "title": "",
    "location": "",
    "bio": "",
    "roles": []
  },
  "projects": [],
  "skills": {
    "technical": [],
    "softSkills": [],
    "frameworks": [],
    "languages": []
  }
}

HTML Content: ${html.substring(0, 10000)}`;

    const extractionResult = await model.generateContent(extractionPrompt);
    const extractedData = JSON.parse(extractionResult.response.text());

    // Second pass: Analysis
    const analysisPrompt = `Analyze this portfolio data for job seeking effectiveness:
${JSON.stringify(extractedData)}

Return only valid JSON matching this structure:
{
  "strengths": [],
  "weaknesses": [],
  "insights": {
    "score": 0,
    "roleClarity": {
      "score": 0,
      "issues": [],
      "suggestedRole": ""
    },
    "projectQuality": {
      "score": 0,
      "issues": [],
      "suggestions": [],
      "hasLiveDemo": false,
      "hasSourceCode": false
    },
    "bioAnalysis": {
      "isOptimal": false,
      "wordCount": 0,
      "issues": [],
      "suggestions": []
    },
    "skillsAnalysis": {
      "focusScore": 0,
      "issues": [],
      "redundantSkills": [],
      "missingCoreSkills": []
    },
    "contentIssues": {
      "buzzwords": [],
      "overusedTerms": [],
      "spamKeywords": [],
      "overclaimedSkills": []
    },
    "criticalFlags": {
      "noProjects": false,
      "multipleRoles": false,
      "inconsistentInfo": false,
      "outdatedTech": false,
      "poorPresentation": false
    },
    "improvements": []
  }
}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisData = JSON.parse(analysisResult.response.text());

    return {
      data: {
        basics: extractedData.basics || {
          name: 'Not Found',
          title: 'Not Found',
          location: 'Not Specified',
          bio: '',
          roles: []
        },
        projects: extractedData.projects || [],
        skills: extractedData.skills || {
          technical: [],
          softSkills: [],
          frameworks: [],
          languages: []
        }
      },
      analysis: {
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        insights: analysisData.insights || {
          score: 0,
          roleClarity: { score: 0, issues: [], suggestedRole: '' },
          projectQuality: { score: 0, issues: [], suggestions: [], hasLiveDemo: false, hasSourceCode: false },
          bioAnalysis: { isOptimal: false, wordCount: 0, issues: [], suggestions: [] },
          skillsAnalysis: { focusScore: 0, issues: [], redundantSkills: [], missingCoreSkills: [] },
          contentIssues: { buzzwords: [], overusedTerms: [], spamKeywords: [], overclaimedSkills: [] },
          criticalFlags: { noProjects: true, multipleRoles: false, inconsistentInfo: false, outdatedTech: false, poorPresentation: false },
          improvements: []
        }
      }
    };
  } catch (error) {
    console.error('Portfolio analysis failed:', error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis(): PortfolioInsights {
  return {
    data: {
      basics: {
        name: 'Not Found',
        title: 'Not Found',
        location: 'Not Specified',
        bio: '',
        roles: []
      },
      projects: [],
      skills: {
        technical: [],
        softSkills: [],
        frameworks: [],
        languages: []
      }
    },
    analysis: {
      strengths: [],
      weaknesses: [],
      insights: {
        score: 0,
        roleClarity: { score: 0, issues: [], suggestedRole: '' },
        projectQuality: { score: 0, issues: [], suggestions: [], hasLiveDemo: false, hasSourceCode: false },
        bioAnalysis: { isOptimal: false, wordCount: 0, issues: [], suggestions: [] },
        skillsAnalysis: { focusScore: 0, issues: [], redundantSkills: [], missingCoreSkills: [] },
        contentIssues: { buzzwords: [], overusedTerms: [], spamKeywords: [], overclaimedSkills: [] },
        criticalFlags: { noProjects: true, multipleRoles: false, inconsistentInfo: false, outdatedTech: false, poorPresentation: false },
        improvements: []
      }
    }
  };
} 
