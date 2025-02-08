import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
interface SimplePortfolioAnalysis {
  data: {
    basics: {
      name: string;
      title: string;
      location: string;
    };
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
    technologies: string[];
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    insights: {
      score: number;
      buzzwords: string[];
      criticalFlaws: string[];
      improvements: string[];
    };
  };
}
export const fetchPortfolioData = async (url: string): Promise<SimplePortfolioAnalysis> => {
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


async function analyzeWithGemini(html: string, url: string): Promise<SimplePortfolioAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this portfolio website HTML and provide key insights:
${url}

Return only JSON with this structure:
{
  "data": {
    "basics": {
      "name": "extracted name",
      "title": "role/title",
      "location": "location"
    },
    "projects": [
      {
        "title": "project name",
        "description": "short description",
        "technologies": ["tech1", "tech2"]
      }
    ],
    "technologies": ["main skills"]
  },
  "analysis": {
    "strengths": ["key strength points"],
    "weaknesses": ["improvement areas"],
    "insights": {
      "score": 0-100,
      "buzzwords": ["overused terms"],
      "criticalFlaws": ["major portfolio issues"],
      "improvements": ["actionable suggestions"]
    }
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(cleanText);
      return {
        data: {
          basics: {
            name: parsed.data?.basics?.name || 'Not Found',
            title: parsed.data?.basics?.title || 'Not Found',
            location: parsed.data?.basics?.location || 'Not Specified'
          },
          projects: Array.isArray(parsed.data?.projects) ? parsed.data.projects : [],
          technologies: Array.isArray(parsed.data?.technologies) ? parsed.data.technologies : []
        },
        analysis: {
          strengths: Array.isArray(parsed.analysis?.strengths) ? parsed.analysis.strengths : [],
          weaknesses: Array.isArray(parsed.analysis?.weaknesses) ? parsed.analysis.weaknesses : [],
          insights: {
            score: parsed.analysis?.insights?.score || 0,
            buzzwords: Array.isArray(parsed.analysis?.insights?.buzzwords) ? parsed.analysis.insights.buzzwords : [],
            criticalFlaws: Array.isArray(parsed.analysis?.insights?.criticalFlaws) ? parsed.analysis.insights.criticalFlaws : [],
            improvements: Array.isArray(parsed.analysis?.insights?.improvements) ? parsed.analysis.insights.improvements : []
          }
        }
      };
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return getDefaultAnalysis();
    }
  } catch (error) {
    console.error('Gemini error:', error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis(): SimplePortfolioAnalysis {
  return {
    data: {
      basics: { name: '', title: '', location: '' },
      projects: [],
      technologies: []
    },
    analysis: {
      strengths: [],
      weaknesses: [],
      insights: {
        score: 0,
        buzzwords: [],
        criticalFlaws: [],
        improvements: []
      }
    }
  };
}