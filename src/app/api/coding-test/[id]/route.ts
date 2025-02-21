import { NextResponse } from 'next/server';
import { prisma } from "@/src/lib/db";
import generatePhdCodingQuestion from '@/src/services/questions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobSeekerId = params.id;
    console.log('Generating questions for jobSeeker:', jobSeekerId);
    
    if (!jobSeekerId) {
      return NextResponse.json(
        { error: 'JobSeeker ID is required' },
        { status: 400 }
      );
    }

    // Find the jobSeeker to get their skills and title
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
      select: {
        skills: true,
        currentJobTitle: true
      }
    });

    if (!jobSeeker) {
      console.log('JobSeeker not found:', jobSeekerId);
      return NextResponse.json(
        { error: 'JobSeeker not found' },
        { status: 404 }
      );
    }

    console.log('Generating questions with skills:', jobSeeker.skills);
    // Generate questions using the jobSeeker's skills and title
    const questions = await generatePhdCodingQuestion(
      jobSeeker.skills,
      jobSeeker.currentJobTitle || 'Software Developer'
    );

    if (!questions) {
      console.log('Failed to generate questions');
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      );
    }

    console.log('Successfully generated questions');
    return NextResponse.json([questions]); // Wrap in array since frontend expects array

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

