import { prisma } from '@/app/utils/db';
import { generateQuestionsForJob } from '@/services/questions';
import { NextResponse } from 'next/server';
import { CodeProblem } from '@/types/code';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // Validate input
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Valid job ID is required' },
        { status: 400 }
      );
    }

    // Check job exists
    const jobExists = await prisma.jobPost.findUnique({
      where: { id }
    });

    if (!jobExists) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    // Check cache first
    const cachedQuestions = await prisma.codingQuestion.findMany({
      where: { jobPostId: id }
    });

    if (cachedQuestions && cachedQuestions.length > 0) {
      return NextResponse.json(cachedQuestions);
    }

    // Generate new questions
    try {
      const questions: CodeProblem[] = await generateQuestionsForJob(id);

      if (!questions || questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Cache the questions
      await prisma.codingQuestion.createMany({
        data: questions.map(q => ({
          ...q,
          jobPostId: id
        }))
      });

      return NextResponse.json(questions);
      
    } catch (genError) {
      console.error('Question generation error:', genError);
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}