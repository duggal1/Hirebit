import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string; id: string } }
) {
  try {
    const { companyid, id } = params;

    // Get job seeker applications for this company
    const applications = await prisma.jobApplication.findMany({
      where: {
        jobSeekerId: id,
        job: {
          companyId: companyid,
        },
      },
      include: {
        jobSeeker: true,
        job: {
          select: {
            id: true,
            jobTitle: true,
            company: {
              select: {
                name: true,
              },
            },
            codingQuestions: {
              select: {
                id: true,
                title: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (applications.length === 0) {
      return NextResponse.json(
        { error: 'No applications found for this job seeker' },
        { status: 404 }
      );
    }

    const jobSeeker = applications[0].jobSeeker;
    const latestApplication = applications[0];

    // Transform the data to match the frontend interface
    const transformedProfile = {
      id: jobSeeker.id,
      name: jobSeeker.name || 'Anonymous',
      email: jobSeeker.email || '',
      phone: latestApplication.phoneNumber,
      status: latestApplication.status || ApplicationStatus.PENDING,
      applications: applications.map((app) => ({
        jobId: app.job.id,
        jobTitle: app.job.jobTitle,
        companyName: app.job.company.name,
        status: app.status,
        appliedDate: app.createdAt.toISOString(),
        lastActivity: app.lastActivity.toISOString(),
        coverLetter: app.coverLetter,
        resume: app.resume,
        education: app.education,
        location: app.location,
        expectedSalary: {
          min: app.expectedSalaryMin,
          max: app.expectedSalaryMax,
        },
        codingTestResults: app.codingTestResults,
        technicalSkills: app.technicalSkillsAssessment,
        cultureFitScore: app.cultureFitScore,
        communicationScore: app.communicationScore,
        recruiterNotes: app.recruiterNotes,
        interviewFeedback: app.interviewFeedback,
        applicationStage: app.applicationStage,
        lastReviewedAt: app.lastReviewedAt?.toISOString(),
        reviewedBy: app.reviewedBy,
        codingQuestions: app.job.codingQuestions,
      })),
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job seeker profile' },
      { status: 500 }
    );
  }
}
