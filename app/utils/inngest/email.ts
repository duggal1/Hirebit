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
interface StripePaymentData {
  id: string;
  amount: number;
  currency: string;
  created: number;
  receipt_url: string;
  billing_details: {
    address: {
      country: string;
      city?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email: string;
    name: string;
  };
  metadata: {
    tax_rate?: string;
    subscription_duration?: string;
    invoice_number?: string;
  };
  payment_method_details: {
    type: string;
    card?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
      country: string;
    };
  };
}

interface PaymentDetails {
  basePrice: number;
  taxes: number;
  total: number;
  currency: string;
  duration: number;
  billingAddress: {
    country: string;
    city?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
  paymentMethod: {
    type: string;
    details: any;
  };
  invoiceNumber: string;
  receiptUrl: string;
}

export const sendPaymentInvoiceEmail = inngest.createFunction(
  {
    id: "send-payment-invoice",
    name: "Send Payment Invoice Email",
    retries: 3,
  },
  { event: "payment.succeeded" },
  async ({ event, step }) => {
    try {
      const { jobId } = event.data;
      
      // Get detailed payment data from Stripe
      const paymentData = await step.run("fetch-payment-data", async () => {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          event.data.paymentIntentId,
          {
            expand: ['latest_charge', 'customer', 'payment_method']
          }
        );
        
        return paymentIntent.latest_charge as StripePaymentData;
      });

      // Fetch job data
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

        if (!job) throw new Error(`Job not found: ${jobId}`);
        return job;
      });

      // Process payment details
      const paymentDetails = await step.run("process-payment-details", async () => {
        const basePrice = paymentData.amount / 100;
        const taxRate = parseFloat(paymentData.metadata.tax_rate || "0.1");
        const taxes = basePrice * taxRate;
        const total = basePrice + taxes;
        const duration = parseInt(paymentData.metadata.subscription_duration || "180");

        return {
          basePrice,
          taxes,
          total,
          currency: paymentData.currency.toUpperCase(),
          duration: Math.floor(duration / 30),
          billingAddress: paymentData.billing_details.address,
          paymentMethod: {
            type: paymentData.payment_method_details.type,
            details: paymentData.payment_method_details
          },
          invoiceNumber: paymentData.metadata.invoice_number || `INV-${Date.now()}`,
          receiptUrl: paymentData.receipt_url
        } as PaymentDetails;
      });

      // Send email with comprehensive payment details
    // In the email sending section, replace the existing code with:
const emailResult = await step.run("send-invoice-email", async () => {
  const recipientEmail = jobData.company.user.email;
  if (!recipientEmail) {
    throw new Error(`No email found for company: ${jobData.company.id}`);
  }

  const startDate = new Date(paymentData.created * 1000);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (paymentDetails.duration * 30));

  const emailComponent = PaymentInvoiceEmail({
    companyName: jobData.company.name,
    jobTitle: jobData.jobTitle,
    amount: `${paymentDetails.currency} ${paymentDetails.total.toFixed(2)}`,
    paymentId: paymentData.id,
    paymentDate: format(startDate, "MMMM dd, yyyy"),
    expirationDate: format(endDate, "MMMM dd, yyyy"),
    jobLocation: jobData.location,
    paymentStatus: "Completed",
    paymentDetails: {
      basePrice: `${paymentDetails.currency} ${paymentDetails.basePrice.toFixed(2)}`,
      taxes: `${paymentDetails.currency} ${paymentDetails.taxes.toFixed(2)}`,
      total: `${paymentDetails.currency} ${paymentDetails.total.toFixed(2)}`,
      duration: `${paymentDetails.duration} months`,
      invoiceNumber: paymentDetails.invoiceNumber,
      billingAddress: paymentDetails.billingAddress,
      paymentMethod: paymentDetails.paymentMethod,
      receiptUrl: paymentDetails.receiptUrl
    }
  });

  return await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: [recipientEmail], // Now we know it's not null
    subject: `Job Posting Confirmation: ${jobData.jobTitle}`,
    react: emailComponent as ReactNode,
  });
});

// Update job post section
await prisma.jobPost.update({
  where: { id: jobId },
  data: {
    status: "ACTIVE",
    invoiceEmailId: emailResult.data?.id,
    invoiceEmailSentAt: new Date(),
    subscriptionStartDate: new Date(paymentData.created * 1000),
    subscriptionEndDate: new Date(paymentData.created * 1000 + (paymentDetails.duration * 30 * 24 * 60 * 60 * 1000)),
    paymentDetails: {
      stripePaymentId: paymentData.id,
      amount: paymentDetails.total,
      basePrice: paymentDetails.basePrice,
      taxes: paymentDetails.taxes,
      currency: paymentDetails.currency,
      duration: paymentDetails.duration,
      invoiceNumber: paymentDetails.invoiceNumber,
      billingAddress: paymentDetails.billingAddress,
      paymentMethod: paymentDetails.paymentMethod,
      receiptUrl: paymentDetails.receiptUrl,
      metadata: paymentData.metadata
    }
  }
});
      return {
        success: true,
        jobId,
        emailId: emailResult.data?.id,
        paymentId: paymentData.id,
        paymentDetails
      };
    } catch (error) {
      console.error("[Inngest] Email failed:", error);
      throw error;
    }
  }
);