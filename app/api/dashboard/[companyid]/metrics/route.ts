import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    const companyId = params.companyid;

    // Forcefully fetch all JobMetrics records for job posts that belong to this company.
    // We include the full jobPost and its related Company data for context.
    const jobMetrics = await prisma.jobMetrics.findMany({
      where: {
        jobPost: {
          company: {
            companyID: companyId, // using companyID if that's what is provided
          },
        },
      },
      include: {
        jobPost: {
          include: {
            company: true, // include all company fields
            codingQuestions: true,
            JobApplication: true,
            SavedJobPost: true,
            JobAnalysis: true,
          },
        },
      },
    });

    return NextResponse.json(jobMetrics);
  } catch (error) {
    console.error('Error fetching all job metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job metrics' },
      { status: 500 }
    );
  }
}
