import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    // Await the params to satisfy Next.js requirements
    const { companyid } = await Promise.resolve(params);

    // Forcefully fetch all JobMetrics records for job posts that belong to this company.
    // Here we assume that the job posts reference the company by its ID.
    const jobMetrics = await prisma.jobMetrics.findMany({
      where: {
        jobPost: {
          companyId: companyid, // Ensure your client passes the correct company id here.
        },
      },
      include: {
        jobPost: {
          include: {
            company: true, // Include all company fields for context
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
