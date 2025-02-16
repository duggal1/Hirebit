// app/api/metrics-call/route.ts
import { NextResponse } from 'next/server';
import { analyzeCandidateMatch } from '@/app/utils/jobAnalysis';

export async function GET(request: Request) {
  // Use the real IDs directly (or optionally, read from URL parameters)
  const jobId = "f21ed7bc-9def-4c37-9c92-bd0e2a51e693";
  const applicationId = "0e685a2a-fafa-4665-839a-99f506222af7";

  console.log('Received metrics-call with jobId:', jobId, 'and applicationId:', applicationId);

  try {
    // Call your analysis function
    const analysisResult = await analyzeCandidateMatch(jobId, applicationId);
    console.log('Analysis result:', analysisResult);
    return NextResponse.json({ analysis: analysisResult });
  } catch (error: any) {
    console.error('Error in analyzeCandidateMatch:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
