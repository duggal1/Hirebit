import { resend, RESEND_FROM_EMAIL } from "../resend/resend";
import { inngest } from "./client";
import { prisma } from "../db";
import { NewsletterEmail } from "@/components/email/inngest/newsletter/newsletter";
import { ReactNode } from "react";



interface CompanyMetrics {
    totalViews: number;
    totalClicks: number;
    applications: number;
    ctr: number;
    conversionRate: number;
    viewsByDate: Record<string, number>;
    clicksByDate: Record<string, number>;
    locationData: string;
    topCandidateMatch?: string;
    candidateMatchScores?: string;
    skillsMatchData?: string;
    marketTrends?: {
      competitorBenchmark?: any;
      marketSalaryData?: any;
      marketSkillsData?: any;
      industryTrends?: any;
    };
  }
  
  interface NewsletterCompany {
    id: string;
    name: string;
    industry: string;
    location: string;
    activeJobCount: number;
    totalJobCount: number;
    techStack: string[];
  }


export const sendNewsletter = inngest.createFunction(
  { 
    id: "send-newsletter",
    name: "Send Newsletter Email",
  },
  { event: "newsletter.scheduled" },
  async ({ event, step }) => {
    const { email, companyId } = event.data;

    try {
      // Fetch company data with proper includes
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          JobPost: {
            where: {
              status: "ACTIVE"
            },
            select: {
              id: true,
              status: true,
              metrics: true
            }
          }
        }
      });

      if (!company) {
        throw new Error(`Company not found: ${companyId}`);
      }

      // Aggregate metrics from all active jobs
      const activeJobs = company.JobPost.filter(job => job.status === "ACTIVE");
      
      const aggregatedMetrics: CompanyMetrics = {
        totalViews: activeJobs.reduce((sum, job) => sum + (job.metrics?.totalViews || 0), 0),
        totalClicks: activeJobs.reduce((sum, job) => sum + (job.metrics?.totalClicks || 0), 0),
        applications: activeJobs.reduce((sum, job) => sum + (job.metrics?.applications || 0), 0),
        ctr: activeJobs.reduce((sum, job) => sum + (job.metrics?.ctr || 0), 0) / (activeJobs.length || 1),
        conversionRate: activeJobs.reduce((sum, job) => sum + (job.metrics?.conversionRate || 0), 0) / (activeJobs.length || 1),
        viewsByDate: {},
        clicksByDate: {},
        locationData: JSON.stringify(
          activeJobs.reduce((acc, job) => {
            const locations = JSON.parse(job.metrics?.locationData?.toString() || '{}');
            Object.entries(locations).forEach(([loc, count]) => {
              acc[loc] = (acc[loc] || 0) + (count as number);
            });
            return acc;
          }, {} as Record<string, number>)
        ),
        topCandidateMatch: JSON.stringify(
          activeJobs.map(job => job.metrics?.topCandidateMatch).filter(Boolean)[0] || {}
        ),
        candidateMatchScores: JSON.stringify(
          activeJobs.map(job => job.metrics?.candidateMatchScores).filter(Boolean)[0] || {}
        ),
        skillsMatchData: JSON.stringify(
          activeJobs.map(job => job.metrics?.skillsMatchData).filter(Boolean)[0] || {}
        ),
        marketTrends: {
          competitorBenchmark: activeJobs.map(job => job.metrics?.competitorBenchmark).filter(Boolean)[0],
          marketSalaryData: activeJobs.map(job => job.metrics?.marketSalaryData).filter(Boolean)[0],
          marketSkillsData: activeJobs.map(job => job.metrics?.marketSkillsData).filter(Boolean)[0],
          industryTrends: activeJobs.map(job => job.metrics?.industryTrends).filter(Boolean)[0]
        }
      };

      // Send newsletter with proper types
      const emailResult = await step.run("send-newsletter-email", async () => {
        const emailComponent = NewsletterEmail({
          company: {
            id: company.id,
            name: company.name,
            industry: company.industry,
            location: company.location,
            activeJobCount: activeJobs.length,
            totalJobCount: company.JobPost.length,
            techStack: company.techStack || []
          },
          metrics: aggregatedMetrics,
          recipientEmail: email
        });

        const response = await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: [email],
          subject: `${company.name} - Weekly Hiring Analytics`,
          react: emailComponent as ReactNode
        });

        return response;
      });

      // Schedule next newsletter
      await inngest.send({
        name: "newsletter.scheduled",
        data: { email, companyId },
        delay: "5d"
      });

      return { 
        success: true, 
        email,
        companyId,
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      console.error("Newsletter send failed:", error);
      throw error;
    }
  }
);