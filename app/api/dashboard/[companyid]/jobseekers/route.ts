import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    const companyId = params.companyid;

    // Forcefully fetch all job seekers who have applied to jobs for the given company.
    // We include full related data from the User record and all applications.
    const jobSeekers = await prisma.jobSeeker.findMany({
      where: {
        applications: {
          some: {
            job: {
              company: {
                companyID: companyId, // filtering based on the company's unique identifier
              },
            },
          },
        },
      },
      include: {
        user: true,       // includes the user's details (name, email, etc.)
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
    console.error('Error fetching all job seekers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job seekers' },
      { status: 500 }
    );
  }
}
