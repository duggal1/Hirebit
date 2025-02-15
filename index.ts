import { analyzeApplicationQuality, analyzeCandidateMatch, analyzeCompetitorBenchmark } from "./app/utils/jobAnalysis";


(async () => {
  try {
    // Replace these IDs with actual IDs from your database.
    const jobId = "fb4c6b8c-6fe9-41b8-89a9-cccfb655a7c2";
    const applicationId = "0e685a2a-fafa-4665-839a-99f506222af7";

    const candidateAnalysis = await analyzeCandidateMatch(jobId, applicationId);
    console.log('Candidate Analysis Result:', candidateAnalysis);

    const applicationQuality = await analyzeApplicationQuality(jobId, applicationId);
    console.log('Application Quality Analysis:', applicationQuality);

    const competitorBenchmark = await analyzeCompetitorBenchmark(jobId);
    console.log('Competitor Benchmark Analysis:', competitorBenchmark);
  } catch (error) {
    console.error('Error during analysis:', error);
  }
})(); 