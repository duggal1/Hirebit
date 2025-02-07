import { prisma } from '@/app/utils/db';
import { generateQuestionsForJob } from '@/services/questions';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if questions already exist in cache
    const cachedQuestions = await prisma.codingQuestion.findMany({
      where: { jobPostId: params.id }
    });

    if (cachedQuestions.length > 0) {
      return NextResponse.json(cachedQuestions);
    }

    // Generate new questions
    const questions = await generateQuestionsForJob(params.id);

    // Cache the questions
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