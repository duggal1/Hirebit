import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    const companyId = params.companyid;

    // Get all job applications for the company with job seeker details
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          companyId: companyId,
        },
      },
      include: {
        jobSeeker: true,
        job: {
          select: {
            jobTitle: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      distinct: ['jobSeekerId'],
    });

    // Transform the data to match the frontend interface
    const transformedJobSeekers = applications.map((application) => ({
      id: application.jobSeekerId,
      name: application.jobSeeker.name || 'Anonymous',
      email: application.jobSeeker.email || '',
      phone: application.phoneNumber,
      status: application.status || ApplicationStatus.PENDING,
      jobTitle: application.job.jobTitle,
      companyName: application.job.company.name,
      appliedDate: application.createdAt.toISOString(),
      lastActivity: application.lastActivity.toISOString(),
      coverLetter: application.coverLetter,
      resume: application.resume,
      education: application.education,
      location: application.location,
      expectedSalary: {
        min: application.expectedSalaryMin,
        max: application.expectedSalaryMax,
      },
      codingTestResults: application.codingTestResults,
      technicalSkills: application.technicalSkillsAssessment,
      cultureFitScore: application.cultureFitScore,
      communicationScore: application.communicationScore,
      recruiterNotes: application.recruiterNotes,
      interviewFeedback: application.interviewFeedback,
      applicationStage: application.applicationStage,
      lastReviewedAt: application.lastReviewedAt?.toISOString(),
      reviewedBy: application.reviewedBy,
    }));

    return NextResponse.json(transformedJobSeekers);
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job seekers' },
      { status: 500 }
    );
  }
}
