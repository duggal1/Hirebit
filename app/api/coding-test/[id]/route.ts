import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';
import generatePhdCodingQuestion from '@/services/questions';

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
    // Check cache first for existing coding questions
    const cachedQuestions = await prisma.codingQuestion.findMany({
      where: { jobPostId: jobId }
    });

    if (cachedQuestions && cachedQuestions.length > 0) {
      return NextResponse.json(cachedQuestions);
    }

    // Fetch the job post to get its jobTitle
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobId }
    });

    if (!jobPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    
  const questions = await generatePhdCodingQuestion([jobId], jobPost.jobTitle);

    return NextResponse.json(questions);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
