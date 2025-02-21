import { prisma } from './db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { inngest } from './inngest/client';

// Initialize Gemini without extra options
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
console.log('Gemini model initialized.');

// Types
export interface CandidateMatchResult {
  overallScore: number;
  skillsScore: number;      // 30% weight
  experienceScore: number;  // 40% weight
  locationScore: number;    // 20% weight
  salaryScore: number;      // 10% weight
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

export interface ApplicationQualityResult {
  score: number;
  feedback: string;
  skillGaps: string[];
  strengths: string[];
  recommendations: string[];
}

export interface CompetitorAnalysisResult {
  marketPosition: string;
  salaryCompetitiveness: string;
  requiredSkillsAnalysis: Record<string, any>;
  industryTrends: string[];
  recommendations: string[];
}

export interface AdditionalMetricsResult {
  timeToFillEstimate: number;
  dropOffAnalysis: Record<string, any>;
  applicationTimeline: Record<string, any>;
  hiringVelocity: Record<string, any>;
}

// Helper: Clean JSON output from Gemini (remove backticks and code fences)
function cleanJSON(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

// Helper functions for matching calculations
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

/**
 * Analyze Candidate Match
 */
export async function analyzeCandidateMatch(jobId: string, applicationId: string): Promise<CandidateMatchResult> {
  console.log('Starting candidate match analysis...');

  // Fetch data from jobPost, jobApplication, and jobSeeker.
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

  // Main analysis prompt with instructions to be concise (max ~256 tokens)
  const mainPrompt = `
Perform a detailed candidate match analysis using these weights:
- Experience: 40%
- Skills: 30%
- Location: 20%
- Salary: 10%

Job Details:
${JSON.stringify({ ...jobPost, extractedKeywords, skillMatch }, null, 2)}

Candidate Profile:
${JSON.stringify({ experience: jobSeeker.experience, skills: jobSeeker.skills, education: jobSeeker.education }, null, 2)}

Please provide a concise JSON response (approximate maximum 500 tokens) with the following keys:
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

  // Calculate weighted score using Gemini scores plus computed location/salary matches
  const weightedScore = {
    experience: analysisData.scores.experience * 0.4,
    skills: analysisData.scores.skills * 0.3,
    location: calculateLocationMatch(jobPost.location, jobSeeker.location || '') * 0.2,
    salary: (isSalaryInRange(jobPost.salaryFrom, jobPost.salaryTo, (application as any).expectedSalaryMin) ? 100 : 0) * 0.1,
  };
  const overallScore = Object.values(weightedScore).reduce((a, b) => a + b, 0);
  console.log('Weighted scores:', weightedScore, 'Overall score:', overallScore);

  const candidateAnalysis: CandidateMatchResult = {
    overallScore,
    skillsScore: analysisData.scores.skills || 0,
    experienceScore: analysisData.scores.experience || 0,
    locationScore: calculateLocationMatch(jobPost.location, jobSeeker.location || ''),
    salaryScore: isSalaryInRange(jobPost.salaryFrom, jobPost.salaryTo, (application as any).expectedSalaryMin) ? 100 : 0,
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

  // Update candidate match fields in job metrics
  const candidateMetrics = {
    candidateMatchScores: { [applicationId]: analysisData.scores || {} },
    skillsMatchData: { [applicationId]: analysisData.keywordAnalysis || {} },
    experienceMatchData: { [applicationId]: analysisData.semanticMatch || {} },
    locationMatchData: { [applicationId]: calculateLocationMatch(jobPost.location, jobSeeker.location || '') },
    salaryMatchData: { [applicationId]: isSalaryInRange(jobPost.salaryFrom, jobPost.salaryTo, (application as any).expectedSalaryMin) },
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

/**
 * Analyze Application Quality
 */
export async function analyzeApplicationQuality(jobId: string, applicationId: string): Promise<ApplicationQualityResult> {
  console.log('Starting application quality analysis...');

  // Fetch jobPost, jobApplication, and jobSeeker data.
  const [jobPost, application, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { company: true }
    }),
    prisma.jobApplication.findUnique({
      where: { id: applicationId }
    }),
    prisma.jobSeeker.findFirst({
      where: { applications: { some: { id: applicationId } } }
    })
  ]);

  if (!jobPost) throw new Error('Job post not found for application quality analysis');
  if (!application) throw new Error('Application not found for application quality analysis');
  if (!jobSeeker) throw new Error('Job seeker not found for application quality analysis');

  console.log('Job post, application, and job seeker found for application quality analysis.');

  // Build a prompt using cover letter and candidate details.
  const prompt = `
Analyze the quality of this job application in detail.

Job Posting:
- Title: ${jobPost.jobTitle}
- Description: ${jobPost.jobDescription}
- Required Skills: ${jobPost.skillsRequired.join(', ')}
- Location: ${jobPost.location}
- Salary Range: ${jobPost.salaryFrom} - ${jobPost.salaryTo}
- Company: ${jobPost.company.name}

Candidate Profile:
- Name: ${jobSeeker.name || 'N/A'}
- Skills: ${(jobSeeker.skills || []).join(', ')}
- Years of Experience: ${jobSeeker.experience}
- Education: ${Array.isArray(jobSeeker.education) ? jobSeeker.education.join(', ') : jobSeeker.education}

Application Details:
- Status: ${application.status}
- Cover Letter: ${application.coverLetter || 'No cover letter provided'}
- AI Score (if available): ${(application as any).aiScore || 'N/A'}

Please provide a concise JSON response (approximate maximum 256 tokens) with the following keys:
{
  "score": number,
  "feedback": string,
  "skillGaps": string[],
  "strengths": string[],
  "recommendations": string[]
}
  `;
  console.log('Sending application quality prompt to Gemini...');
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

  // Update application quality fields in job metrics.
  const qualityMetrics = {
    applicationQuality: { [applicationId]: qualityAnalysis },
    applicationScores: { [applicationId]: qualityAnalysis.score },
    applicationFeedback: { [applicationId]: qualityAnalysis.feedback },
    skillGaps: { [applicationId]: qualityAnalysis.skillGaps }
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

/**
 * Analyze Competitor Benchmark
 */
export async function analyzeCompetitorBenchmark(jobId: string): Promise<CompetitorAnalysisResult> {
  console.log('Starting competitor benchmark analysis for jobId:', jobId);
  
  // Fetch job post (including company data)
  const jobPost = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: { company: true },
  });
  if (!jobPost) throw new Error('Job post not found for competitor benchmark analysis');
  console.log('Job post found:', jobPost.id);

  // Fetch similar jobs (excluding the current one)
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
Analyze this job posting compared to similar positions.

Target Job:
- Title: ${jobPost.jobTitle}
- Company: ${jobPost.company.name}
- Skills Required: ${jobPost.skillsRequired.join(', ')}
- Salary Range: ${jobPost.salaryFrom} - ${jobPost.salaryTo}
- Location: ${jobPost.location}

Similar Jobs:
${similarJobs.map(job => `
- Title: ${job.jobTitle}
- Skills: ${job.skillsRequired.join(', ')}
- Salary Range: ${job.salaryFrom} - ${job.salaryTo}
- Location: ${job.location}
`).join('\n')}

Please provide a concise JSON response (approximate maximum 256 tokens) with the following keys:
{
  "marketPosition": string,
  "salaryCompetitiveness": string,
  "requiredSkillsAnalysis": {},
  "industryTrends": string[],
  "recommendations": string[]
}
  `;
  console.log('Sending competitor benchmark prompt to Gemini...');
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

  // Update competitor benchmark fields in job metrics.
  const competitorMetrics = {
    competitorBenchmark: competitorAnalysis,
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

/**
 * Analyze Additional Metrics (Time to Fill, Drop-Off, Timeline, Hiring Velocity)
 */
export async function analyzeAdditionalMetrics(jobId: string): Promise<AdditionalMetricsResult> {
  console.log('Starting additional metrics analysis for jobId:', jobId);

  // Fetch the job metrics record (which should contain funnel data like views, clicks, applications, etc.)
  const metrics = await prisma.jobMetrics.findUnique({
    where: { jobPostId: jobId },
  });
  if (!metrics) throw new Error('Job metrics not found for additional metrics analysis');

  // Construct a prompt using the available funnel data.
  const prompt = `
Using the following job metrics data:
- Total Views: ${metrics.totalViews || 0}
- Total Clicks: ${metrics.totalClicks || 0}
- Total Applications: ${metrics.applications || 0}
- Views By Date: ${JSON.stringify(metrics.viewsByDate)}
- Clicks By Date: ${JSON.stringify(metrics.clicksByDate)}

Please provide a concise JSON response (approximate maximum 256 tokens) with the following keys:
{
  "timeToFillEstimate": number,
  "dropOffAnalysis": {},
  "applicationTimeline": {},
  "hiringVelocity": {}
}
  `;
  console.log('Sending additional metrics prompt to Gemini...');
  const additionalResult = await model.generateContent(prompt);
  const rawAdditional = cleanJSON(additionalResult.response.text());
  console.log('Raw additional metrics output:', rawAdditional);

  let additionalMetrics: AdditionalMetricsResult;
  try {
    additionalMetrics = JSON.parse(rawAdditional);
  } catch (err) {
    console.error('Error parsing additional metrics response. Cleaned output:', rawAdditional);
    throw err;
  }
  console.log('Additional metrics analysis received:', additionalMetrics);

  // Update additional metrics fields in job metrics.
  await prisma.jobMetrics.update({
    where: { jobPostId: jobId },
    data: {
      timeToFillEstimate: additionalMetrics.timeToFillEstimate,
      dropOffAnalysis: JSON.stringify(additionalMetrics.dropOffAnalysis),
      applicationTimeline: JSON.stringify(additionalMetrics.applicationTimeline),
      hiringVelocity: JSON.stringify(additionalMetrics.hiringVelocity),
    },
  });
  console.log('Job metrics updated with additional metrics data.');

  return additionalMetrics;
}
