import { prisma } from './db';
import { getLocationFromIP } from './location';

export type JobMetricsData = {
  totalViews: number;
  totalClicks: number;
  totalApplications: number;
  ctr: number;
  conversionRate: number;
  viewsByDate: Record<string, number>;
  clicksByDate: Record<string, number>;
  locationData: Record<string, number>;
};

export async function calculateAndUpdateJobMetrics(jobId: string): Promise<JobMetricsData> {
  try {
    // Get location data
    const location = await getLocationFromIP();
    const locationString = `${location.city}, ${location.country}`;

    // Get the job metrics
    const jobMetrics = await prisma.jobMetrics.findUnique({
      where: { jobPostId: jobId },
      include: {
        jobPost: {
          select: {
            views: true,
            clicks: true,
          }
        }
      }
    });

    if (!jobMetrics) {
      // Initialize metrics if they don't exist
      const today = new Date().toISOString().split('T')[0];
     
      // Initialize metrics if they don't exist
      const newMetrics = await prisma.jobMetrics.create({
        data: {
          jobPostId: jobId,
          totalViews: 0,
          totalClicks: 0,
          applications: 0,
          ctr: 0,
          conversionRate: 0,
          viewsByDate: {},
          clicksByDate: {},
          locationData: {}
        }
      });
      
      return {
        totalViews: 0,
        totalClicks: 0,
        totalApplications: 0,
        ctr: 0,
        conversionRate: 0,
        viewsByDate: {},
        clicksByDate: {},
        locationData: {}
      };
    }

    // Calculate metrics
    const totalViews = jobMetrics.totalViews;
    const totalClicks = jobMetrics.totalClicks;
    const totalApplications = jobMetrics.applications;

    // Calculate CTR (Click-Through Rate)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Calculate Conversion Rate (Applications / Clicks)
    const conversionRate = totalClicks > 0 ? (totalApplications / totalClicks) * 100 : 0;

    // Update metrics in database
    await prisma.jobMetrics.update({
      where: { jobPostId: jobId },
      data: {
        ctr: Math.round(ctr * 100) / 100, // Round to 2 decimal places
        conversionRate: Math.round(conversionRate * 100) / 100,
      }
    });

    return {
      totalViews,
      totalClicks,
      totalApplications,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      viewsByDate: jobMetrics.viewsByDate as Record<string, number>,
      clicksByDate: jobMetrics.clicksByDate as Record<string, number>,
      locationData: jobMetrics.locationData as Record<string, number>
    };
  } catch (error) {
    console.error('Failed to calculate job metrics:', error);
    throw error;
  }
}

export async function updateMetricsWithLocation(jobId: string, metricType: 'view' | 'click') {
  try {
    const location = await getLocationFromIP();
    const locationString = `${location.city}, ${location.country}`;
    const today = new Date().toISOString().split('T')[0];

    const metrics = await prisma.jobMetrics.findUnique({
      where: { jobPostId: jobId }
    });

    if (!metrics) {
      // Create new metrics if they don't exist
      const initialData = {
        jobPostId: jobId,
        totalViews: metricType === 'view' ? 1 : 0,
        totalClicks: metricType === 'click' ? 1 : 0,
        viewsByDate: metricType === 'view' ? { [today]: 1 } : {},
        clicksByDate: metricType === 'click' ? { [today]: 1 } : {},
        locationData: { [locationString]: 1 }
      };

      await prisma.jobMetrics.create({ data: initialData });
      return;
    }

    // Update existing metrics
    const locationData = { ...(metrics.locationData as any) };
    locationData[locationString] = (locationData[locationString] || 0) + 1;

    const updateData: any = {
      locationData
    };

    if (metricType === 'view') {
      const viewsByDate = { ...(metrics.viewsByDate as any) };
      viewsByDate[today] = (viewsByDate[today] || 0) + 1;
      updateData.viewsByDate = viewsByDate;
      updateData.totalViews = { increment: 1 };
    } else {
      const clicksByDate = { ...(metrics.clicksByDate as any) };
      clicksByDate[today] = (clicksByDate[today] || 0) + 1;
      updateData.clicksByDate = clicksByDate;
      updateData.totalClicks = { increment: 1 };
    }

    await prisma.jobMetrics.update({
      where: { jobPostId: jobId },
      data: updateData
    });

    // Calculate and update CTR and conversion rate
    await calculateAndUpdateJobMetrics(jobId);
  } catch (error) {
    console.error(`Failed to update ${metricType} metrics with location:`, error);
  }
}

export async function incrementJobApplications(jobId: string) {
  try {
    const jobMetrics = await prisma.jobMetrics.findUnique({
      where: { jobPostId: jobId }
    });

    if (!jobMetrics) {
      // Create initial metrics if they don't exist
      await prisma.jobMetrics.create({
        data: {
          jobPostId: jobId,
          totalViews: 0,
          totalClicks: 0,
          applications: 1,
          ctr: 0,
          conversionRate: 0,
          viewsByDate: {},
          clicksByDate: {},
          locationData: {}
        }
      });
    } else {
      // Update application count and recalculate conversion rate
      const newApplicationCount = jobMetrics.applications + 1;
      const conversionRate = jobMetrics.totalClicks > 0 
        ? (newApplicationCount / jobMetrics.totalClicks) * 100 
        : 0;

      await prisma.jobMetrics.update({
        where: { jobPostId: jobId },
        data: {
          applications: { increment: 1 },
          conversionRate: Math.round(conversionRate * 100) / 100
        }
      });
    }
  } catch (error) {
    console.error('Failed to increment job applications:', error);
  }
}
