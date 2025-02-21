import { format } from "date-fns";
import { Resend } from "resend";
import { inngest } from "./client";
import { stripe } from "../stripe";
import { prisma } from "../db";
import { PaymentInvoiceEmail } from "@/components/email/inngest/email-template";
import type { CreateEmailResponse } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const RESEND_FROM_EMAIL = `Hirebit <invoices@${process.env.RESEND_DOMAIN || 'hirebit.site'}>`;

interface PaymentSuccessEvent {
  data: {
    paymentIntentId: string;
    jobId: string;
  };
}
export const sendPaymentInvoiceEmail = inngest.createFunction(
  { 
    id: "send-payment-invoice", 
    name: "Send Payment Invoice Email",
    retries: 3
  },
  { event: "payment.succeeded" },
  async ({ event, step }) => {
    console.log("[Inngest] Starting with data:", event.data);
    
    try {
      const { jobId } = event.data;
      const paymentIntentId = event.data.paymentIntentId || 'manual_creation';

      if (!jobId) {
        throw new Error(`Missing required jobId`);
      }

      // Fetch job and company details
      const jobData = await step.run("fetch-job-details", async () => {
        const job = await prisma.jobPost.findUnique({
          where: { id: jobId },
          include: {
            company: {
              include: {
                user: true
              }
            }
          }
        });

        if (!job || !job.company) {
          throw new Error(`Job or company not found for jobId: ${jobId}`);
        }

        return job;
      });

      // Verify email exists
      if (!jobData.company.user.email) {
        throw new Error(`No email found for company: ${jobData.company.id}`);
      }

      // Calculate expiration date
      const startDate = new Date();
      const expirationDate = new Date(startDate);
      expirationDate.setDate(startDate.getDate() + (jobData.listingDuration || 30));

    // ...existing code...

// Send email
const emailResult = await step.run("send-invoice-email", async () => {
  const recipientEmail = jobData.company.user.email;
  
  if (!recipientEmail) {
    throw new Error(`Invalid recipient email for company: ${jobData.company.id}`);
  }
  
  console.log("[Inngest] Sending email to:", recipientEmail);
  
  const response = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: [recipientEmail], // Convert to array to satisfy type requirement
    subject: `Job Posting Confirmation: ${jobData.jobTitle}`,
    react: PaymentInvoiceEmail({
      companyName: jobData.company.name,
      jobTitle: jobData.jobTitle,
      amount: `$${(jobData.salaryFrom / 100).toFixed(2)}`,
      paymentId: paymentIntentId,
      paymentDate: format(new Date(), "MMMM dd, yyyy"),
      expirationDate: format(expirationDate, "MMMM dd, yyyy"),
      jobDuration: `${jobData.listingDuration} days`,
      jobLocation: jobData.location,
      paymentStatus: "Completed"
    })
  });

  if (response.error) {
    throw new Error(`Email send failed: ${response.error.message}`);
  }

  return response;
});


      // Update job with email data
      await prisma.jobPost.update({
        where: { id: jobId },
        data: {
          status: "ACTIVE",
          invoiceEmailId: emailResult.data?.id,
          invoiceEmailSentAt: new Date(),
          invoiceData: {
            emailId: emailResult.data?.id,
            sentAt: new Date().toISOString(),
            amount: jobData.salaryFrom,
            expirationDate: expirationDate.toISOString(),
            paymentMethod: "Direct Creation",
            receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/job/${jobId}`
          }
        },
      });

      return {
        success: true,
        jobId,
        emailId: emailResult.data?.id,
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error("[Inngest] Email failed:", error);
      throw error;
    }
  }
);