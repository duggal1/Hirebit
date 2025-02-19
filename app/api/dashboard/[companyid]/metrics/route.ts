import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    console.log('\n🔍 Starting Metrics API request...');
    const { companyid } = await Promise.resolve(params);
    console.log('Company ID from URL:', companyid);

    // Verify that the company exists using the companyID field
    const company = await prisma.company.findUnique({
      where: { companyID: companyid }
    });
    if (!company) {
      console.log('❌ Company not found');
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    console.log('✅ Found Company:', company.name, '| Internal Company ID:', company.id);

    // Retrieve all active job posts for the company using the internal company.id
    const jobPostsWithMetrics = await prisma.jobPost.findMany({
      where: {
        companyId: company.id,
        status: 'ACTIVE'
      },
      include: {
        metrics: {
          select: {
            totalViews: true,
            totalClicks: true,
            applications: true,
            ctr: true,
            conversionRate: true,
            viewsByDate: true,
            clicksByDate: true,
            locationData: true,
          }
        },
        JobApplication: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
    console.log(`📋 Found ${jobPostsWithMetrics.length} active job posts with metrics for "${company.name}"`);
    console.log('Raw Job Posts with Metrics Data:', jobPostsWithMetrics);

    // Transform metrics for frontend consumption
    const transformedMetrics = jobPostsWithMetrics.map(post => ({
      jobId: post.id,
      jobTitle: post.jobTitle,
      jobStatus: post.status, // Enum value (e.g., "ACTIVE")
      metrics: {
        views: post.metrics?.totalViews ?? 0,
        clicks: post.metrics?.totalClicks ?? 0,
        applications: post.metrics?.applications ?? 0,
        ctr: post.metrics?.ctr ?? 0,
        conversionRate: post.metrics?.conversionRate ?? 0,
        viewsTrend: post.metrics?.viewsByDate ?? {},
        clicksTrend: post.metrics?.clicksByDate ?? {},
        locationData: post.metrics?.locationData ?? {},
        applicationDetails: post.JobApplication
      },
      createdAt: post.createdAt
    }));

    console.log('\n✅ Transformed Metrics:', transformedMetrics);

    return NextResponse.json(transformedMetrics);
    
  } catch (error: any) {
    console.error('\n❌ Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error.message },
      { status: 500 }
    );
  }
}
