// app/api/metrics-call/route.ts

import { NextResponse } from 'next/server';
import { analyzeCandidateMatch, analyzeApplicationQuality, analyzeCompetitorBenchmark, analyzeAdditionalMetrics } from '@/app/utils/jobAnalysis';
import { prisma } from '@/app/utils/db';

export async function GET(request: Request) {
  // Use the real IDs directly (or optionally, read from URL parameters)
  const jobId = "f21ed7bc-9def-4c37-9c92-bd0e2a51e693";
  const applicationId = "0e685a2a-fafa-4665-839a-99f506222af7";

  console.log('Received metrics-call with jobId:', jobId, 'and applicationId:', applicationId);

  try {
    // Run each analysis in parallel if they don't depend on one another:
    const [
      candidateMatchAnalysis,
      applicationQualityAnalysis,
      competitorBenchmarkAnalysis,
      additionalMetricsAnalysis
    ] = await Promise.all([
      analyzeCandidateMatch(jobId, applicationId),
      analyzeApplicationQuality(jobId, applicationId),
      analyzeCompetitorBenchmark(jobId),
      analyzeAdditionalMetrics(jobId)
    ]);

    // Optionally, you might want to combine these results into one JSON response.
    // If each analysis function already updates JobMetrics via Prisma,
    // this API call serves as a trigger and returns the fresh analysis results.
    const responsePayload = {
      candidateMatch: candidateMatchAnalysis,
      applicationQuality: applicationQualityAnalysis,
      competitorBenchmark: competitorBenchmarkAnalysis,
      additionalMetrics: additionalMetricsAnalysis
    };

    console.log('Analysis results:', responsePayload);

    // Optionally, fetch the updated JobMetrics record to verify all fields are saved correctly:
    const updatedJobMetrics = await prisma.jobMetrics.findUnique({
      where: { jobPostId: jobId }
    });
    console.log('Updated JobMetrics record:', updatedJobMetrics);

    return NextResponse.json({
      analysis: responsePayload,
      jobMetrics: updatedJobMetrics
    });
  } catch (error: any) {
    console.error('Error in metrics-call:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
