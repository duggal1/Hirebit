import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';
import { JobPostStatus, ApplicationStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    const companyId = params.companyid;

    // Get total applications
    const totalApplications = await prisma.jobApplication.count({
      where: {
        job: {
          companyId: companyId,
        },
      },
    });

    // Get application status breakdown
    const applicationStatusCounts = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: {
        job: {
          companyId: companyId,
        },
      },
      _count: true,
    });

    // Get job metrics
    const jobMetrics = await prisma.jobPost.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
        jobTitle: true,
        status: true,
        applications: true,
        views: true,
        clicks: true,
        metrics: {
          select: {
            totalViews: true,
            totalClicks: true,
            applications: true,
            viewsByDate: true,
            clicksByDate: true,
            locationData: true,
          },
        },
      },
    });

    // Get active jobs count
    const activeJobs = await prisma.jobPost.count({
      where: {
        companyId: companyId,
        status: JobPostStatus.ACTIVE,
      },
    });

    // Calculate average scores
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          companyId: companyId,
        },
      },
      select: {
        cultureFitScore: true,
        communicationScore: true,
        codingTestResults: true,
      },
    });

    let totalCultureFitScore = 0;
    let totalCommunicationScore = 0;
    let totalCodingScore = 0;
    let cultureFitCount = 0;
    let communicationCount = 0;
    let codingTestCount = 0;

    applications.forEach((app) => {
      if (app.cultureFitScore) {
        totalCultureFitScore += app.cultureFitScore;
        cultureFitCount++;
      }
      if (app.communicationScore) {
        totalCommunicationScore += app.communicationScore;
        communicationCount++;
      }
      if (app.codingTestResults) {
        const results = app.codingTestResults as any;
        if (Array.isArray(results)) {
          results.forEach((result: any) => {
            if (result.score) {
              totalCodingScore += result.score;
              codingTestCount++;
            }
          });
        }
      }
    });

    return NextResponse.json({
      overview: {
        totalApplications,
        activeJobs,
        averageScores: {
          cultureFit: cultureFitCount > 0 ? Math.round(totalCultureFitScore / cultureFitCount) : 0,
          communication: communicationCount > 0 ? Math.round(totalCommunicationScore / communicationCount) : 0,
          codingTest: codingTestCount > 0 ? Math.round(totalCodingScore / codingTestCount) : 0,
        },
      },
      applicationStatus: applicationStatusCounts.reduce((acc, curr) => {
        acc[curr.status as ApplicationStatus] = curr._count;
        return acc;
      }, {} as Record<ApplicationStatus, number>),
      jobMetrics: jobMetrics.map((job) => ({
        id: job.id,
        title: job.jobTitle,
        status: job.status,
        metrics: {
          applications: job.applications,
          views: job.views,
          clicks: job.clicks,
          ...job.metrics,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
