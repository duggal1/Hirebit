import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    const companyId = params.companyid;

    // Fetch all job applications with related data for the company
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {  // Changed from jobPost to job
          companyId: companyId,
        },
      },
      include: {
        jobSeeker: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            experience: true,
            currentJobTitle: true,
            skills: true,
            education: true,
            resume: true
          }
        },
        job: {  // Changed from jobPost to job
          select: {
            jobTitle: true,
            codingQuestions: {
              select: {
                id: true,
                title: true,
                difficulty: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data for the frontend
    const logs = applications.map((app) => {
      return {
        id: app.id,
        name: app.jobSeeker?.name || 'Anonymous',
        email: app.jobSeeker?.email || '',
        phone: app.jobSeeker?.phoneNumber || '',
        status: app.status || 'PENDING',
        appliedDate: app.createdAt.toISOString(),
        jobTitle: app.job?.jobTitle || '',
        coverLetter: app.coverLetter,
        experience: app.jobSeeker?.experience 
          ? `${app.jobSeeker.experience} years`
          : 'No experience',
        currentRole: app.jobSeeker?.currentJobTitle || '',
        education: app.jobSeeker?.education 
          ? JSON.stringify(app.jobSeeker.education)
          : 'No education details',
        skills: app.jobSeeker?.skills || [],
      };
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching application logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application logs' },
      { status: 500 }
    );
  }
}

