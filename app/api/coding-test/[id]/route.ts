import { prisma } from '@/app/utils/db';
import { generateQuestionsForJob } from '@/services/questions';
import { NextResponse } from 'next/server';
import { CodeProblem } from '@/types/code';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  try {
    // Add validation for job existence
    const jobExists = await prisma.jobPost.findUnique({
      where: { id: params.id }
    });

    if (!jobExists) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    const cachedQuestions = await prisma.codingQuestion.findMany({
      where: { jobPostId: params.id }
    });

    if (cachedQuestions.length > 0) {
      return NextResponse.json(cachedQuestions);
    }

    const questions: CodeProblem[] = await generateQuestionsForJob(params.id);

    // Validate questions before caching
    if (!questions || questions.length === 0) {
      throw new Error('No questions generated');
    }

    await prisma.codingQuestion.createMany({
      data: questions.map(q => ({
        ...q,
        jobPostId: params.id
      }))
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}