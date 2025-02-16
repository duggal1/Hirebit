import { prisma } from './db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { inngest } from './inngest/client';

//
// Initialize Gemini
//
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
console.log('Gemini model initialized.');

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
// Helper: Clean JSON output from Gemini
//
function cleanJSON(text: string): string {
  let cleaned = text.trim();
  // Remove triple backticks and an optional "json" specifier if present.
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

//
// Helper functions for matching calculations
//
function normalizeSkills(skills: string[]): string[] {
  return skills.map(skill => skill.toLowerCase().trim());
}

function calculateSkillMatch(required: string[], candidate: string[]): { matched: string[]; missing: string[]; score: number } {
  const normalizedRequired = normalizeSkills(required);
  const normalizedCandidate = normalizeSkills(candidate);
  const matched = normalizedRequired.filter(skill => normalizedCandidate.includes(skill));
  const missing = normalizedRequired.filter(skill => !normalizedCandidate.includes(skill));
  return {
    matched,
    missing,
    score: normalizedRequired.length ? (matched.length / normalizedRequired.length) * 100 : 0,
  };
}

function calculateLocationMatch(jobLocation: string, candidateLocation: string): number {
  if (!jobLocation || !candidateLocation) return 0;
  return jobLocation.toLowerCase() === candidateLocation.toLowerCase() ? 100 : 0;
}

function isSalaryInRange(min: number, max: number, expected?: number): boolean {
  if (!expected) return false;
  return expected >= min && expected <= max;
}

function getTotalExperience(workExperience: any[] = []): number {
  return workExperience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);
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

//
// Parsing placeholders – replace these with your actual parsing logic if available
//
function parseApplicationQualityResponse(text: string): ApplicationQualityResult {
  console.log('Parsing application quality response...');
  // Placeholder: return an empty structure
  return {
    score: 0,
    feedback: '',
    skillGaps: [],
    strengths: [],
    recommendations: [],
  };
}

function parseCompetitorAnalysisResponse(text: string): CompetitorAnalysisResult {
  console.log('Parsing competitor analysis response...');
  // Placeholder: return an empty structure
  return {
    marketPosition: '',
    salaryCompetitiveness: '',
    requiredSkillsAnalysis: {},
    industryTrends: [],
    recommendations: [],
  };
}

//
// Main Functions
//

export async function analyzeCandidateMatch(jobId: string, applicationId: string): Promise<CandidateMatchResult> {
  console.log('Starting candidate match analysis...');

  // Fetch data from all relevant tables
  const [jobPost, application, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { company: true, metrics: true },
    }),
    prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { jobSeeker: true },
    }),
    prisma.jobSeeker.findFirst({
      where: { applications: { some: { id: applicationId } } },
    }),
  ]);

  if (!jobPost) throw new Error('Job post not found');
  console.log('Job post found:', jobPost.id);
  if (!application) throw new Error('Application not found');
  console.log('Application found:', application.id);
  if (!jobSeeker) throw new Error('Job seeker not found');
  console.log('Job seeker found:', jobSeeker.id);

  // Keyword extraction prompt
  const keywordExtractionPrompt = `
Extract key requirements and keywords from this job description:
${jobPost.jobDescription}

Please output ONLY valid JSON (with no additional text) using these exact keys:
{
  "technical": string[],
  "soft": string[],
  "industry": string[],
  "experience": string[],
  "education": string[],
  "culture": string[]
}
  `;
  console.log('Sending keyword extraction prompt...');
  const keywordsResult = await model.generateContent(keywordExtractionPrompt);
  const rawKeywordsText = cleanJSON(keywordsResult.response.text());
  console.log('Raw keyword extraction output:', rawKeywordsText);

  let extractedKeywords: any;
  try {
    extractedKeywords = JSON.parse(rawKeywordsText);
  } catch (err) {
    console.error('Error parsing keywords result. Cleaned output:', rawKeywordsText);
    throw err;
  }
  console.log('Extracted keywords:', extractedKeywords);

  // Calculate initial skill match
  const skillMatch = calculateSkillMatch(extractedKeywords.technical, jobSeeker.skills || []);
  console.log('Calculated skill match:', skillMatch);

  // Main analysis prompt
  const mainPrompt = `
Perform a detailed candidate match analysis using these weights:
- Experience: 40% weight
- Skills: 30% weight
- Location: 20% weight
- Salary: 10% weight

Job Details:
${JSON.stringify({ ...jobPost, extractedKeywords, skillMatch }, null, 2)}

Candidate Profile:
${JSON.stringify({ experience: jobSeeker.experience, skills: jobSeeker.skills, education: jobSeeker.education }, null, 2)}

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
  "scores": { "skills": number, "experience": number, "location": number, "salary": number },
  "semanticMatch": { "skillsSimilarity": number, "experienceSimilarity": number, "domainKnowledge": number, "cultureFit": number },
  "keywordAnalysis": { "matched": string[], "missing": string[] },
  "feedback": string,
  "recommendations": string[]
}
  `;
  console.log('Sending main candidate analysis prompt...');
  const mainResult = await model.generateContent(mainPrompt);
  const rawMainResponse = cleanJSON(mainResult.response.text());
  console.log('Raw main analysis output:', rawMainResponse);

  let analysisData: any;
  try {
    analysisData = JSON.parse(rawMainResponse);
  } catch (err) {
    console.error('Error parsing main analysis response. Cleaned output:', rawMainResponse);
    throw err;
  }
  console.log('Analysis data received:', analysisData);

  // Calculate weighted score
  const weightedScore = {
    experience: analysisData.scores.experience * 0.4,
    skills: analysisData.scores.skills * 0.3,
    location: analysisData.scores.location * 0.2,
    salary: analysisData.scores.salary * 0.1,
  };
  const overallScore = Object.values(weightedScore).reduce((a, b) => a + b, 0);
  console.log('Weighted scores:', weightedScore, 'Overall score:', overallScore);

  const candidateAnalysis: CandidateMatchResult = {
    overallScore,
    skillsScore: analysisData.scores.skills || 0,
    experienceScore: analysisData.scores.experience || 0,
    locationScore: analysisData.scores.location || 0,
    salaryScore: analysisData.scores.salary || 0,
    feedback: analysisData.feedback || '',
    extractedKeywords: {
      jobRequirements: (extractedKeywords.technical || []).concat(extractedKeywords.soft || []),
      candidateSkills: jobSeeker.skills || [],
      matchedSkills: analysisData.keywordAnalysis?.matched || [],
      missingSkills: analysisData.keywordAnalysis?.missing || [],
    },
    semanticMatchDetails: analysisData.semanticMatch || {},
    matchDetails: {
      weightedScores: weightedScore,
      keywordMatchRate: analysisData.keywordAnalysis?.matched
        ? analysisData.keywordAnalysis.matched.length / (extractedKeywords.technical.length || 1)
        : 0,
      experienceYearsMatch: jobPost.requiredExperience <= jobSeeker.experience,
      locationMatch: calculateLocationMatch(jobPost.location, jobSeeker.location || ''),
      salaryMatch: isSalaryInRange(jobPost.salaryFrom, jobPost.salaryTo, (application as any).expectedSalaryMin),
    },
    recommendations: analysisData.recommendations || [],
  };
  console.log('Final candidate match analysis:', candidateAnalysis);

  // Update job metrics for candidate match analysis (ensuring organized structure)
  const candidateMetrics = {
    candidateMatchScores: { [applicationId]: analysisData.scores || {} },
    skillsMatchData: { [applicationId]: analysisData.keywordAnalysis || {} },
    experienceMatchData: { [applicationId]: analysisData.semanticMatch || {} },
    locationMatchData: { [applicationId]: analysisData.locationMatch || {} },
    salaryMatchData: { [applicationId]: analysisData.salaryMatch || {} },
    topCandidateMatch: {
      [applicationId]: {
        score: overallScore,
        feedback: analysisData.feedback || "",
        matchDetails: weightedScore,
        recommendations: analysisData.recommendations || [],
      },
    },
  };
  console.log('Updating job metrics for candidate match analysis...');
  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: {
      candidateMatchScores: JSON.stringify(candidateMetrics.candidateMatchScores),
      skillsMatchData: JSON.stringify(candidateMetrics.skillsMatchData),
      experienceMatchData: JSON.stringify(candidateMetrics.experienceMatchData),
      locationMatchData: JSON.stringify(candidateMetrics.locationMatchData),
      salaryMatchData: JSON.stringify(candidateMetrics.salaryMatchData),
      topCandidateMatch: JSON.stringify(candidateMetrics.topCandidateMatch),
    },
  });
  console.log('Job metrics updated successfully for candidate match analysis.');

  return candidateAnalysis;
}

export async function analyzeApplicationQuality(jobId: string, applicationId: string): Promise<ApplicationQualityResult> {
  console.log('Starting application quality analysis...');
  const [jobPost, application, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({ where: { id: jobId }, include: { company: true } }),
    prisma.jobApplication.findUnique({ where: { id: applicationId } }),
    prisma.jobSeeker.findFirst({ where: { applications: { some: { id: applicationId } } } }),
  ]);
  if (!jobPost) throw new Error('Job post not found for application quality analysis');
  if (!application) throw new Error('Application not found for application quality analysis');
  if (!jobSeeker) throw new Error('Job seeker not found for application quality analysis');
  console.log('Job post, application, and job seeker found for application quality analysis.');

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
Score: ${(application as any).aiScore || 'N/A'}

Provide:
1. Overall application quality score (0-100)
2. Specific feedback
3. Identified skill gaps
4. Key strengths
5. Recommendations for improvement
  `;
  console.log('Sending application quality prompt...');
  const qualityResult = await model.generateContent(prompt);
  const rawAppQuality = cleanJSON(qualityResult.response.text());
  console.log('Raw application quality output:', rawAppQuality);
  let qualityAnalysis: ApplicationQualityResult;
  try {
    qualityAnalysis = JSON.parse(rawAppQuality);
  } catch (err) {
    console.error('Error parsing application quality response. Cleaned output:', rawAppQuality);
    throw err;
  }
  console.log('Application quality analysis received:', qualityAnalysis);

  // Update job metrics for application quality (ensuring organized structure)
  const qualityMetrics = {
    applicationQuality: { [applicationId]: qualityAnalysis || {} },
    applicationScores: { [applicationId]: qualityAnalysis.score || 0 },
    applicationFeedback: { [applicationId]: qualityAnalysis.feedback || "" },
    skillGaps: { [applicationId]: qualityAnalysis.skillGaps || [] },
  };
  console.log('Updating job metrics for application quality...');
  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: {
      applicationQuality: JSON.stringify(qualityMetrics.applicationQuality),
      applicationScores: JSON.stringify(qualityMetrics.applicationScores),
      applicationFeedback: JSON.stringify(qualityMetrics.applicationFeedback),
      skillGaps: JSON.stringify(qualityMetrics.skillGaps),
    },
  });
  console.log('Job metrics updated with application quality data.');

  return qualityAnalysis;
}

export async function analyzeCompetitorBenchmark(jobId: string): Promise<CompetitorAnalysisResult> {
  console.log('Starting competitor benchmark analysis for jobId:', jobId);
  const jobPost = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: { company: true },
  });
  if (!jobPost) throw new Error('Job post not found for competitor benchmark analysis');
  console.log('Job post found:', jobPost.id);

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
  console.log('Found', similarJobs.length, 'similar jobs.');

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
  console.log('Sending competitor benchmark prompt...');
  const competitorResult = await model.generateContent(prompt);
  const rawCompetitor = cleanJSON(competitorResult.response.text());
  console.log('Raw competitor benchmark output:', rawCompetitor);
  let competitorAnalysis: CompetitorAnalysisResult;
  try {
    competitorAnalysis = JSON.parse(rawCompetitor);
  } catch (err) {
    console.error('Error parsing competitor benchmark response. Cleaned output:', rawCompetitor);
    throw err;
  }
  console.log('Competitor analysis received:', competitorAnalysis);

  // Update job metrics for competitor analysis (ensuring organized structure)
  const competitorMetrics = {
    competitorBenchmark: competitorAnalysis || {},
    marketSalaryData: {
      average: calculateAverageSalary(similarJobs),
      range: getSalaryRange(similarJobs),
      competitiveness: competitorAnalysis.salaryCompetitiveness || "",
    },
    marketSkillsData: competitorAnalysis.requiredSkillsAnalysis || {},
    industryTrends: competitorAnalysis.industryTrends || [],
  };
  console.log('Updating job metrics for competitor benchmark analysis...');
  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: {
      competitorBenchmark: JSON.stringify(competitorMetrics.competitorBenchmark),
      marketSalaryData: JSON.stringify(competitorMetrics.marketSalaryData),
      marketSkillsData: JSON.stringify(competitorMetrics.marketSkillsData),
      industryTrends: JSON.stringify(competitorMetrics.industryTrends),
    },
  });
  console.log('Job metrics updated with competitor benchmark analysis.');

  return competitorAnalysis;
}
