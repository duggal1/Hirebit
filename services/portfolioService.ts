
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyPortfolio } from './isverificationportfoliio';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');



export interface PortfolioInsights {
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
      };   verification?: {
        isVerified: boolean;
        message: string;
        score: number;
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
      console.log('Analysis completed:', portfolioData);
      
      if (!portfolioData?.data?.basics?.name) {
        console.error('Invalid analysis result:', portfolioData);
        throw new Error('Analysis returned invalid data structure');
      }
  
      // Add verification
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
// Define the default analysis function at the top level
function getDefaultAnalysis(): PortfolioInsights {
  return {
    data: {
      basics: {
        name: 'Name not found',
        title: 'Role not specified',
        location: 'Location not provided',
        bio: 'No biography or self-description found',
        roles: ['Role information not available']
      },
      projects: [{
        title: 'Portfolio needs projects',
        description: 'Consider adding projects to showcase your skills',
        technologies: ['Add relevant technologies'],
        liveUrl: '',
        sourceUrl: ''
      }],
      skills: {
        technical: ['Add your technical skills'],
        softSkills: ['Add your soft skills'],
        frameworks: ['List frameworks you use'],
        languages: ['List programming languages']
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
          suggestedRole: 'Consider specifying your target role'
        },
        projectQuality: {
          score: 0,
          issues: ['Projects section needs attention'],
          suggestions: [
            'Add project descriptions',
            'Include tech stack details',
            'Link to live demos',
            'Add source code links'
          ],
          hasLiveDemo: false,
          hasSourceCode: false
        },
        bioAnalysis: {
          isOptimal: false,
          wordCount: 0,
          issues: ['Bio needs expansion'],
          suggestions: [
            'Add professional summary',
            'Highlight key achievements',
            'Mention career goals'
          ]
        },
        skillsAnalysis: {
          focusScore: 20,
          issues: ['Skills section needs development'],
          redundantSkills: [],
          missingCoreSkills: [
            'Core technical skills',
            'Industry-specific skills',
            'Relevant frameworks'
          ]
        },
        contentIssues: {
          buzzwords: [],
          overusedTerms: [],
          spamKeywords: [],
          overclaimedSkills: []
        },
        criticalFlags: {
          noProjects: true,
          multipleRoles: false,
          inconsistentInfo: false,
          outdatedTech: false,
          poorPresentation: true
        },
        improvements: [
          'Add detailed project descriptions',
          'Include technical skill set',
          'Expand professional summary',
          'Add contact information',
          'Include social/professional links'
        ],
        verification: {
          isVerified: false,
          message: '',
          score: 0
        }
      }
    }
  };
}async function analyzeWithGemini(html: string, url: string): Promise<PortfolioInsights> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    console.log('Starting initial data extraction...');
    
    // First pass: More detailed extraction prompt
    const extractionPrompt = `Analyze this portfolio website HTML thoroughly and extract all possible information.
Be very detailed and don't skip any technical information.

URL: ${url}

Follow these detailed extraction rules:
1. Name and Title:
   - Extract full name
   - Current role/position
   - All mentioned job titles or roles
   - Location details

2. Technical Skills:
   - List ALL mentioned technologies, no matter how briefly referenced
   - Include frameworks, libraries, and tools
   - Note programming languages with their context
   - Identify build tools and development environments
   - Look for cloud platforms or services

3. Projects:
   - Extract ALL projects, even if briefly mentioned
   - For each project, find:
     * Full description
     * Technologies used
     * GitHub links
     * Live demo URLs
     * Role or contribution
     * Technical challenges mentioned
     * Architecture decisions

4. Writing Analysis:
   - Identify technical jargon
   - Note recurring phrases
   - Calculate bio length
   - Analyze writing style

Return a detailed JSON with all findings:
{
  "data": {
    "basics": {
      "name": "extracted name",
      "title": "main role",
      "location": "location if found",
      "bio": "full bio text",
      "roles": ["all roles mentioned"]
    },
    "projects": [
      {
        "title": "project name",
        "description": "detailed description",
        "technologies": ["all techs used"],
        "liveUrl": "demo link",
        "sourceUrl": "code link",
        "technicalDetails": ["architecture", "challenges", "solutions"],
        "impact": "project outcomes or metrics"
      }
    ],
    "skills": {
      "technical": ["all technical skills"],
      "softSkills": ["communication skills", "methodologies"],
      "frameworks": ["all frameworks"],
      "languages": ["all programming languages"],
      "tools": ["development tools"],
      "platforms": ["cloud services", "hosting"]
    },
    "writingAnalysis": {
      "style": "writing style assessment",
      "techTerms": ["technical terms used"],
      "commonPhrases": ["repeated phrases"],
      "bioLength": "word count"
    }
  }
}

Analyze this HTML content in detail: ${html.substring(0, 15000)}`;

    const extractionResult = await model.generateContent(extractionPrompt);
    const extractionText = extractionResult.response.text().trim();
    console.log('✅Raw extraction completed. Length:', extractionText.length);
   // Improved JSON parsing for extraction result
   let extractedData;
   try {
     const cleanedExtractionText = extractionText
       .replace(/```json\s*|\s*```/g, '') // Remove JSON code blocks
       .replace(/^JSON\s*|^\s*{/m, '{')   // Clean up any "JSON" prefix
       .trim();
     
     extractedData = JSON.parse(cleanedExtractionText);
     
     // Validate extracted data structure
     if (!extractedData?.data) {
       throw new Error('Invalid data structure in extraction result');
     }

     console.log('Extraction successful. Found:', {
       projectCount: extractedData.data?.projects?.length || 0,
       skillsCount: extractedData.data?.skills?.technical?.length || 0,
       hasProjects: extractedData.data?.projects?.length > 0,
       hasTechSkills: extractedData.data?.skills?.technical?.length > 0
     });
   } catch (parseError) {
     console.error('❌Failed to parse extraction result:', parseError);
     return getDefaultAnalysis();
   }


    // Second pass: Enhanced analysis with more specific criteria
    console.log('Starting detailed analysis...');
   // Replace the existing analysisPrompt with this simplified version
   const analysisPrompt = `Analyze this portfolio data critically and thoroughly:
   ${JSON.stringify(extractedData, null, 2)}
   
   Provide a detailed technical analysis. Focus on:
   1. Technical depth and breadth
   2. Project complexity
   3. Modern vs outdated technologies
   4. Best practices adherence
   5. Buzzword usage
   6. Technical writing quality
   
   Return a detailed JSON analysis:
   {
     "strengths": ["detailed strength points"],
     "weaknesses": ["specific improvement areas"],
     "insights": {
       "score": "0-100 based on technical depth and presentation",
       "roleClarity": {
         "score": "0-100",
         "issues": ["specific role alignment issues"],
         "suggestedRole": "recommended role based on skills"
       },
       "projectQuality": {
         "score": "0-100",
         "issues": ["specific project concerns"],
         "suggestions": ["detailed improvement ideas"],
         "hasLiveDemo": "boolean",
         "hasSourceCode": "boolean",
         "technicalDepth": "assessment of technical complexity"
       },
       "bioAnalysis": {
         "isOptimal": "boolean",
         "wordCount": "number",
         "issues": ["specific content issues"],
         "suggestions": ["detailed improvements"]
       },
       "skillsAnalysis": {
         "focusScore": "0-100",
         "issues": ["skill gaps", "focus areas"],
         "redundantSkills": ["overlapping skills"],
         "missingCoreSkills": ["essential missing skills"],
         "modernization": ["outdated skills to update"]
       },
       "contentIssues": {
         "buzzwords": ["identified buzzwords"],
         "overusedTerms": ["overused technical terms"],
         "spamKeywords": ["suspicious terms"],
         "overclaimedSkills": ["skills needing verification"]
       },
       "criticalFlags": {
         "noProjects": "boolean",
         "multipleRoles": "boolean",
         "inconsistentInfo": "boolean",
         "outdatedTech": "boolean",
         "poorPresentation": "boolean",
         "reasons": ["detailed explanations"]
       },
       "improvements": ["prioritized, actionable improvements"]
     }
   }`;
   
const analysisResult = await model.generateContent(analysisPrompt);
const analysisText = analysisResult.response.text().trim();
console.log('Analysis completed. Length:', analysisText.length);
let analysisData;
try {
  const cleanedAnalysisText = analysisText
    .replace(/```(?:json)?\s*|\s*```/g, '') // Remove code blocks with or without language
    .replace(/^JSON\s*|^\s*{/m, '{')        // Clean up any "JSON" prefix
    .replace(/(\r\n|\n|\r)/gm, '')          // Remove line breaks
    .replace(/\s+/g, ' ')                   // Normalize whitespace
    .trim();

  analysisData = JSON.parse(cleanedAnalysisText);
  
  // Validate analysis data structure
  if (!analysisData?.insights) {
    throw new Error('Invalid analysis data structure');
  }

  console.log('Analysis successful. Scores:', {
    overall: analysisData.insights?.score || 0,
    roleClarity: analysisData.insights?.roleClarity?.score || 0,
    projectQuality: analysisData.insights?.projectQuality?.score || 0,
    skillsFocus: analysisData.insights?.skillsAnalysis?.focusScore || 0
  });
} catch (parseError) {
  console.error('Failed to parse analysis result:', parseError);
  console.error('Raw analysis text:', analysisText);
  return getDefaultAnalysis();
}

// Return combined results
return {
  data: {
    ...extractedData.data,
    projects: extractedData.data.projects || [],
    skills: extractedData.data.skills || { 
      technical: [], 
      softSkills: [], 
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