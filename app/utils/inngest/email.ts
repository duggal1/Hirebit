import { format } from "date-fns";
import { Resend } from "resend";
import { inngest } from "./client";
import { stripe } from "../stripe";
import { prisma } from "../db";
import { PaymentInvoiceEmail } from "@/components/email/inngest/email-template";
import type { CreateEmailResponse } from "resend";
import React, { ReactNode } from "react";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const RESEND_FROM_EMAIL = `Hirebit <invoices@${process.env.RESEND_DOMAIN || "hirebit.site"}>`;

// Define better types for email response
interface EmailResult {
  id: string;
  from: string;
  to: string[];
  subject: string;
}

// Add types for job data
interface JobData {
  id: string;
  jobTitle: string;
  company: {
    id: string;
    name: string;
    about: string;
    user: {
      email: string | null;
    };
  };
  paymentAmount?: number;
  salaryFrom: number;
  salaryTo: number;
  listingDuration: number;
  location: string;
  jobDescription: string;
  benefits: string[];
  skillsRequired: string[];
}

export const sendPaymentInvoiceEmail = inngest.createFunction(
  {
    id: "send-payment-invoice",
    name: "Send Payment Invoice Email",
    retries: 3,
  },
  { event: "payment.succeeded" },
  async ({ event, step }) => {
    console.log("[Inngest] Starting with data:", event.data);

    try {
      const { jobId } = event.data;
      const paymentIntentId = event.data.paymentIntentId || "manual_creation";

      if (!jobId) {
        throw new Error(`Missing required jobId`);
      }

      // Fetch job and company details with type assertion
      const jobData = await step.run("fetch-job-details", async () => {
        const job = await prisma.jobPost.findUnique({
          where: { id: jobId },
          include: {
            company: {
              include: {
                user: true,
              },
            },
          },
        }) as JobData;

        if (!job?.company?.user?.email) {
          throw new Error(`Invalid job data for jobId: ${jobId}`);
        }

        return job;
      });

      const startDate = new Date();
      const expirationDate = new Date(startDate);
      expirationDate.setDate(startDate.getDate() + (jobData.listingDuration || 30));

      // Send email with proper typing
      const emailResult = await step.run("send-invoice-email", async () => {
        const recipientEmail = jobData.company.user.email;

        if (!recipientEmail) {
          throw new Error(`Invalid recipient email for company: ${jobData.company.id}`);
        }

        const emailComponent = PaymentInvoiceEmail({
          companyName: jobData.company.name,
          jobTitle: jobData.jobTitle,
          amount: `$${(jobData.paymentAmount || jobData.salaryFrom / 100).toFixed(2)}`,
          paymentId: paymentIntentId,
          paymentDate: format(new Date(), "MMMM dd, yyyy"),
          expirationDate: format(expirationDate, "MMMM dd, yyyy"),
          jobDuration: `${jobData.listingDuration} days`,
          jobLocation: jobData.location,
          paymentStatus: "Completed",
          companyDescription: jobData.company.about,
          jobDescription: jobData.jobDescription,
          benefits: jobData.benefits,
          skillsRequired: jobData.skillsRequired,
          salary: {
            from: jobData.salaryFrom,
            to: jobData.salaryTo,
          },
          recipientEmail,
          companyId: jobData.company.id,
        });

        // First cast to unknown and then to EmailResult
        const response = await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: [recipientEmail],
          subject: `Job Posting Confirmation: ${jobData.jobTitle}`,
          react: emailComponent as ReactNode,
        }) as unknown as EmailResult;

        return response;
      });

      // Update job with email data
      await prisma.jobPost.update({
        where: { id: jobId },
        data: {
          status: "ACTIVE",
          invoiceEmailId: emailResult.id,
          invoiceEmailSentAt: new Date(),
          invoiceData: {
            emailId: emailResult.id,
            sentAt: new Date().toISOString(),
            amount: jobData.salaryFrom,
            expirationDate: expirationDate.toISOString(),
            paymentMethod: "Direct Creation",
            receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/job/${jobId}`,
          },
        },
      });

      return {
        success: true,
        jobId,
        emailId: emailResult.id,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Inngest] Email failed:", error);
      throw error;
    }
  }
);
