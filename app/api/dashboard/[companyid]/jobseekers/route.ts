import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    // Await the params before using its properties.
    const { companyid } = await Promise.resolve(params);

    // Forcefully fetch all job seekers who have applied to jobs for the given company.
    // This query returns job seekers that have at least one application for a job from this company.
    const jobSeekers = await prisma.jobSeeker.findMany({
      where: {
        applications: {
          some: {
            job: {
              companyId: companyid,
            },
          },
        },
      },
      include: {
        user: true, // Include full user details (name, email, etc.)
        applications: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
        },
        Verification: true,
      },
    });

    return NextResponse.json(jobSeekers);
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job seekers' },
      { status: 500 }
    );
  }
}
