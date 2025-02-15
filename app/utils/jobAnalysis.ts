import { prisma } from './db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { inngest } from './inngest/client';



//
// Initialize Gemini
//
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

//
// Types
//
interface CandidateMatchResult {
  overallScore: number;
  skillsScore: number;  // 30% weight
  experienceScore: number;  // 40% weight
  locationScore: number;  // 20% weight
  salaryScore: number;  // 10% weight
  feedback: string;
  extractedKeywords: {
    jobRequirements: string[];
    candidateSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
  };
  semanticMatchDetails: {
    skillsSimilarity: number;
    experienceSimilarity: number;
    domainKnowledge: number;
    cultureFit: number;
  };
  matchDetails: {
    weightedScores: {
      experience: number;
      skills: number;
      location: number;
      salary: number;
    };
    keywordMatchRate: number;
    experienceYearsMatch: boolean;
    locationMatch: number;
    salaryMatch: boolean;
  };
  recommendations: string[];
}

interface ApplicationQualityResult {
  score: number;
  feedback: string;
  skillGaps: string[];
  strengths: string[];
  recommendations: string[];
}

interface CompetitorAnalysisResult {
  marketPosition: string;
  salaryCompetitiveness: string;
  requiredSkillsAnalysis: Record<string, any>;
  industryTrends: string[];
  recommendations: string[];
}

//
// Main functions
//

export async function analyzeCandidateMatch(jobId: string, applicationId: string): Promise<CandidateMatchResult> {
  // Fetch data from all relevant tables
  const [jobPost, application, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        metrics: true,
      },
    }),
    prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { 
        jobSeeker: true // include relation so we can use application.jobSeeker if needed 
      }
    }),
    prisma.jobSeeker.findFirst({
      where: {
        applications: {
          some: {
            id: applicationId,
          },
        },
      },
      // In our schema, jobSeeker.skills is string[] and experience is a number, education is JSON.
      // Therefore we don't include further relations.
    }),
  ]);

  if (!jobPost) {
    throw new Error('Job post not found');
  }

  if (!application) {
    throw new Error('Application not found');
  }

  if (!jobSeeker) {
    throw new Error('Job seeker not found');
  }

  // Extract keywords from job description using Gemini
  const keywordExtractionPrompt = `
Extract key requirements and keywords from this job description:
${jobPost.jobDescription}

Please identify:
1. Required technical skills
2. Soft skills
3. Industry knowledge
4. Experience requirements
5. Education requirements
6. Cultural aspects

Format as JSON with these exact keys:
{
  "technical": string[],
  "soft": string[],
  "industry": string[],
  "experience": string[],
  "education": string[],
  "culture": string[]
}
  `;

  const keywordsResult = await model.generateContent(keywordExtractionPrompt);
  const extractedKeywords = JSON.parse(keywordsResult.response.text());

  // Calculate initial skill match
  // Here, jobSeeker.skills is string[]
  const skillMatch = calculateSkillMatch(
    extractedKeywords.technical,
    jobSeeker.skills || []
  );

  // Main analysis prompt
  const prompt = `
Perform a detailed candidate match analysis using these weights:
- Experience: 40% weight
- Skills: 30% weight
- Location: 20% weight
- Salary: 10% weight

Job Details:
${JSON.stringify({
  ...jobPost,
  extractedKeywords,
  skillMatch
}, null, 2)}

Candidate Profile:
${JSON.stringify({
  experience: jobSeeker.experience,
  skills: jobSeeker.skills,
  education: jobSeeker.education,
  // You can add more candidate details if needed
}, null, 2)}

Provide a detailed analysis with:
1. Semantic matching scores (0-100) for each category
2. Keyword matching analysis
3. Experience relevance analysis
4. Cultural fit assessment
5. Domain knowledge evaluation
6. Specific recommendations
7. Areas for improvement

Format response as JSON with these exact keys:
{
  "scores": {
    "skills": number,
    "experience": number,
    "location": number,
    "salary": number
  },
  "semanticMatch": {
    "skillsSimilarity": number,
    "experienceSimilarity": number,
    "domainKnowledge": number,
    "cultureFit": number
  },
  "keywordAnalysis": {
    "matched": string[],
    "missing": string[]
  },
  "feedback": string,
  "recommendations": string[]
}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const analysisData = JSON.parse(response.text());

  // Calculate weighted score
  const weightedScore = {
    experience: analysisData.scores.experience * 0.4,
    skills: analysisData.scores.skills * 0.3,
    location: analysisData.scores.location * 0.2,
    salary: analysisData.scores.salary * 0.1,
  };

  const overallScore = Object.values(weightedScore).reduce((a, b) => a + b, 0);

  const analysis: CandidateMatchResult = {
    overallScore,
    skillsScore: analysisData.scores.skills,
    experienceScore: analysisData.scores.experience,
    locationScore: analysisData.scores.location,
    salaryScore: analysisData.scores.salary,
    feedback: analysisData.feedback,
    extractedKeywords: {
      jobRequirements: (extractedKeywords.technical || []).concat(extractedKeywords.soft || []),
      candidateSkills: jobSeeker.skills || [],
      matchedSkills: analysisData.keywordAnalysis.matched,
      missingSkills: analysisData.keywordAnalysis.missing,
    },
    semanticMatchDetails: analysisData.semanticMatch,
    matchDetails: {
      weightedScores: weightedScore,
      keywordMatchRate: analysisData.keywordAnalysis.matched.length / (extractedKeywords.technical.length || 1),
      // Use jobSeeker.experience as the total years of experience
      experienceYearsMatch: jobPost.requiredExperience <= jobSeeker.experience,
      locationMatch: calculateLocationMatch(jobPost.location, jobSeeker.location || ''),
      // For salary, assume jobSeeker has an expectedSalary field (if not, adjust accordingly)
      salaryMatch: isSalaryInRange(jobPost.salaryFrom, jobPost.salaryTo, (jobSeeker as any).expectedSalary),
    },
    recommendations: analysisData.recommendations,
  };

  // Prepare metrics update data – store as JSON strings
  const metricsUpdate: any = {
    candidateMatchScores: JSON.stringify({
      [applicationId]: {
        scores: analysisData.scores,
        feedback: analysisData.feedback,
      },
    }),
    skillsMatchData: JSON.stringify({
      [applicationId]: {
        matched: analysisData.keywordAnalysis.matched,
        missing: analysisData.keywordAnalysis.missing,
        matchRate: analysisData.keywordAnalysis.matched.length / (extractedKeywords.technical.length || 1),
      },
    }),
    experienceMatchData: JSON.stringify({
      [applicationId]: {
        // Assuming experienceSimilarity and domainKnowledge are available
        relevantExperience: analysisData.semanticMatch.experienceSimilarity,
        domainKnowledge: analysisData.semanticMatch.domainKnowledge,
      },
    }),
  };

  if (overallScore > 80) {
    metricsUpdate.topCandidateMatch = JSON.stringify({
      [applicationId]: {
        score: overallScore,
        feedback: analysisData.feedback,
        matchDetails: weightedScore,
        recommendations: analysisData.recommendations,
      },
    });
  }

  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: metricsUpdate,
  });

  return analysis;
}

export async function analyzeApplicationQuality(jobId: string, applicationId: string): Promise<ApplicationQualityResult> {
  const [jobPost, application, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { company: true },
    }),
    prisma.jobApplication.findUnique({
      where: { id: applicationId },
    }),
    prisma.jobSeeker.findFirst({
      where: {
        applications: {
          some: {
            id: applicationId,
          },
        },
      },
      // jobSeeker.skills is string[], education is JSON, experience is number.
    }),
  ]);

  if (!jobPost) {
    throw new Error('Job post not found');
  }

  if (!application) {
    throw new Error('Application not found');
  }

  if (!jobSeeker) {
    throw new Error('Job seeker not found');
  }

  const prompt = `
Analyze this job application quality:

Job Requirements:
${jobPost.jobDescription}
Company: ${jobPost.company.name}

Candidate Profile:
Skills: ${(jobSeeker.skills || []).join(', ')}
Experience: ${jobSeeker.experience} years
Education: ${JSON.stringify(jobSeeker.education)}

Application:
Status: ${application.status}
Score: ${(application as any).score || 'N/A'}

Provide:
1. Overall application quality score (0-100)
2. Specific feedback
3. Identified skill gaps
4. Key strengths
5. Recommendations for improvement
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const analysis = parseApplicationQualityResponse(response.text());

  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: {
      applicationQuality: JSON.stringify({
        [applicationId]: analysis,
      }),
      applicationScores: JSON.stringify({
        [applicationId]: analysis.score,
      }),
      applicationFeedback: JSON.stringify({
        [applicationId]: analysis.feedback,
      }),
      skillGaps: JSON.stringify({
        [applicationId]: analysis.skillGaps,
      }),
    },
  });

  return analysis;
}

export async function analyzeCompetitorBenchmark(jobId: string): Promise<CompetitorAnalysisResult> {
  const jobPost = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: {
      company: true,
    },
  });

  if (!jobPost) {
    throw new Error('Job post not found');
  }

  // Get similar job posts
  const similarJobs = await prisma.jobPost.findMany({
    where: {
      AND: [
        { id: { not: jobId } },
        { jobTitle: { contains: jobPost.jobTitle } },
        { status: 'ACTIVE' },
      ],
    },
    take: 10,
  });

  const prompt = `
Analyze this job posting compared to similar positions:

Target Job:
- Title: ${jobPost.jobTitle}
- Company: ${jobPost.company.name}
- Skills Required: ${jobPost.skillsRequired.join(', ')}
- Salary Range: ${jobPost.salaryFrom}-${jobPost.salaryTo}
- Location: ${jobPost.location}

Similar Jobs:
${similarJobs.map(job => `
- Title: ${job.jobTitle}
- Skills: ${job.skillsRequired.join(', ')}
- Salary: ${job.salaryFrom}-${job.salaryTo}
- Location: ${job.location}
`).join('\n')}

Provide:
1. Market position analysis
2. Salary competitiveness
3. Required skills comparison
4. Industry trends
5. Recommendations for improvement
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const analysis = parseCompetitorAnalysisResponse(response.text());

  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: {
      competitorBenchmark: JSON.stringify(analysis),
      marketSalaryData: JSON.stringify({
        average: calculateAverageSalary(similarJobs),
        range: getSalaryRange(similarJobs),
        competitiveness: analysis.salaryCompetitiveness,
      }),
      marketSkillsData: JSON.stringify(analysis.requiredSkillsAnalysis),
      industryTrends: JSON.stringify(analysis.industryTrends),
    },
  });

  return analysis;
}

//
// Helper functions
//

function getTotalExperience(workExperience: any[] = []): number {
  // Not used now – we use jobSeeker.experience (a number)
  return workExperience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);
}

function calculateLocationMatch(jobLocation: string, candidateLocation: string): number {
  if (!jobLocation || !candidateLocation) return 0;
  return jobLocation.toLowerCase() === candidateLocation.toLowerCase() ? 100 : 0;
}

function isSalaryInRange(min: number, max: number, expected?: number): boolean {
  if (!expected) return false;
  return expected >= min && expected <= max;
}

function normalizeSkills(skills: string[]): string[] {
  return skills.map(skill => skill.toLowerCase().trim());
}

function calculateSkillMatch(required: string[], candidate: string[]): {
  matched: string[];
  missing: string[];
  score: number;
} {
  const normalizedRequired = normalizeSkills(required);
  const normalizedCandidate = normalizeSkills(candidate);

  const matched = normalizedRequired.filter(skill =>
    normalizedCandidate.includes(skill)
  );

  const missing = normalizedRequired.filter(skill =>
    !normalizedCandidate.includes(skill)
  );

  return {
    matched,
    missing,
    score: normalizedRequired.length ? (matched.length / normalizedRequired.length) * 100 : 0,
  };
}

function parseApplicationQualityResponse(text: string): ApplicationQualityResult {
  // Implement your parsing logic here
  return {
    score: 0,
    feedback: '',
    skillGaps: [],
    strengths: [],
    recommendations: [],
  };
}

function parseCompetitorAnalysisResponse(text: string): CompetitorAnalysisResult {
  // Implement your parsing logic here
  return {
    marketPosition: '',
    salaryCompetitiveness: '',
    requiredSkillsAnalysis: {},
    industryTrends: [],
    recommendations: [],
  };
}

function calculateAverageSalary(jobs: any[]): number {
  const salaries = jobs.map(job => (job.salaryFrom + job.salaryTo) / 2);
  return salaries.reduce((a, b) => a + b, 0) / (salaries.length || 1);
}

function getSalaryRange(jobs: any[]): { min: number; max: number } {
  return {
    min: Math.min(...jobs.map(job => job.salaryFrom)),
    max: Math.max(...jobs.map(job => job.salaryTo)),
  };

}
