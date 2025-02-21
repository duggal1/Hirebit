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
    location: {  // Add location object
      country: string;
      city?: string;
      state?: string;
    };
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
  status: string;  // Add status
  createdAt: Date;  // Add createdAt
  activatedAt?: Date;  // Add activatedAt as optional
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
  metadata?: {
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
    } | null;
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
      const { jobId, paymentIntentId, amount, currency } = event.data;

      const jobData = await step.run("fetch-job-data", async () => {
        const job = await prisma.jobPost.findUnique({
          where: { id: jobId },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                about: true,
                location: true,  // Include company location
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        });
      
        if (!job) {
          throw new Error(`Job not found: ${jobId}`);
        }
      
        return {
          ...job,
          company: {
            ...job.company,
            location: job.company.location || {
              country: 'US',
              city: undefined,
              state: undefined
            }
          }
        } as JobData;
      });
      

      const paymentData = await step.run("fetch-payment-data", async () => {
        if (paymentIntentId === 'manual_creation') {
          return {
            id: `manual_${Date.now()}`,
            amount: 24900,
            currency: currency || 'usd',
            created: Date.now() / 1000,
            billing_details: {
              address: {
                country: jobData.company.location.country || 'US',
                city: jobData.company.location.city,
                state: jobData.company.location.state,
              },
              email: jobData.company.user.email || '',
              name: jobData.company.name || ''
            },
            metadata: {
              tax_rate: '0.1',
              subscription_duration: '180', // 6 months
              invoice_number: `INV-${jobData.id}-${Date.now()}`,
              job_post_id: jobData.id
            },
            payment_method_details: {
              type: 'manual',
              card: null
            },
            receipt_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/download/${jobData.id}`
          } as StripePaymentData;
        }
       
  // Regular Stripe payment
  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    {
      expand: ['latest_charge', 'customer']
    }
  );
  
  if (!paymentIntent.latest_charge) {
    throw new Error(`No charge found for payment intent: ${paymentIntentId}`);
  }

  return paymentIntent.latest_charge as StripePaymentData;
});

if (!paymentData) {
  throw new Error('Failed to fetch payment data');
}
    
// Update the process-payment-details section with null checks
const paymentDetails = await step.run("process-payment-details", async () => {
  const basePrice = (paymentData?.amount || 0) / 100;
  const taxRate = parseFloat(paymentData?.metadata?.tax_rate || "0.1");
  const taxes = basePrice * taxRate;
  const total = basePrice + taxes;
  const duration = parseInt(paymentData?.metadata?.subscription_duration || "180");

  return {
    basePrice,
    taxes,
    total,
    currency: (paymentData?.currency || 'usd').toUpperCase(),
    duration: Math.floor(duration / 30),
    billingAddress: paymentData?.billing_details?.address || {
      country: 'US'
    },
    paymentMethod: {
      type: paymentData?.payment_method_details?.type || 'manual',
      details: paymentData?.payment_method_details || { type: 'direct' }
    },
    invoiceNumber: paymentData?.metadata?.invoice_number || `INV-${Date.now()}`,
    receiptUrl: paymentData?.receipt_url || `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${jobId}`
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
    amount: `${paymentDetails.total} ${paymentDetails.currency}`,
    paymentId: paymentData.id,
    paymentDate: format(new Date(paymentData.created * 1000), "MMMM dd, yyyy"),
    expirationDate: format(endDate, "MMMM dd, yyyy"),
    jobLocation: jobData.location,
    paymentStatus: "Completed",
    jobPostInfo: {  // Add this object
      id: jobData.id,
      status: jobData.status,
      createDate: format(new Date(jobData.createdAt), "MMMM dd, yyyy"),
      activationDate: format(new Date(jobData.activatedAt || Date.now()), "MMMM dd, yyyy")
    },
    paymentDetails: {
  
      basePrice: `${paymentDetails.basePrice} ${paymentDetails.currency}`,
      taxes: `${paymentDetails.taxes} ${paymentDetails.currency}`,
      total: `${paymentDetails.total} ${paymentDetails.currency}`,
      duration: `${paymentDetails.duration} months`,
      invoiceNumber: paymentDetails.invoiceNumber,
      billingAddress: paymentDetails.billingAddress,
      paymentMethod: paymentDetails.paymentMethod,
      subscriptionInfo: {
        planName: "6 Month Job Posting",
        startDate: format(startDate, "MMMM dd, yyyy"),
        endDate: format(endDate, "MMMM dd, yyyy"),
        status: "ACTIVE"
      },
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