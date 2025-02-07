import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';
import { generateQuestionsForJob } from '@/services/questions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const jobId = params?.id;
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cachedQuestions = await prisma.codingQuestion.findMany({
      where: { jobPostId: jobId }
    });

    if (cachedQuestions && cachedQuestions.length > 0) {
      return NextResponse.json(cachedQuestions);
    }

    // Generate new questions
    const questions = await generateQuestionsForJob(jobId);
    return NextResponse.json(questions);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}