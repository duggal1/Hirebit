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


type SubscriptionDuration = '1' | '3' | '6';

const PRICING = {
  BASE_MONTHLY_PRICE: 49.99,
  TAX_RATE: 0.1,
  DURATIONS: {
    '6': {
      months: 6,
      price: 249.00,  // Fixed price for 6 months
      discount: 0.17  // (~17% off monthly price)
    },
    '3': {
      months: 3,
      price: 129.00,  // Fixed price for 3 months
      discount: 0.14  // (~14% off monthly price)
    },
    '1': {
      months: 1,
      price: 49.99,   // Standard monthly price
      discount: 0     // No discount for single month
    }
  } as Record<SubscriptionDuration, { months: number; price: number; discount: number }>
};

// Update the calculation function to use fixed prices
const calculateSubscriptionPrice = (durationInMonths: number) => {
  const durationKey = durationInMonths.toString() as SubscriptionDuration;
  const duration = PRICING.DURATIONS[durationKey] || {
    months: 1,
    price: PRICING.BASE_MONTHLY_PRICE,
    discount: 0
  };

  const basePrice = duration.price;
  const taxes = basePrice * PRICING.TAX_RATE;
  const monthlyPrice = PRICING.BASE_MONTHLY_PRICE * duration.months;
  const savings = monthlyPrice - basePrice;

  return {
    basePrice,
    taxes,
    total: basePrice + taxes,
    duration: duration.months,
    savings: savings > 0 ? savings : 0
  };
};

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
    base_price?: string;
    savings?: string;
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

  savings?: number;
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
          // Calculate price based on duration
          const subscriptionDuration = parseInt(event.data.subscriptionDuration || '6');
          const pricing = calculateSubscriptionPrice(subscriptionDuration);
          
          
          return {
            id: `manual_${Date.now()}`,
            amount: Math.round(pricing.total * 100), // Convert to cents
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
              tax_rate: PRICING.TAX_RATE.toString(),
              subscription_duration: (subscriptionDuration * 30).toString(),
              invoice_number: `INV-${jobData.id}-${Date.now()}`,
              job_post_id: jobData.id,
              base_price: pricing.basePrice.toString(),
              savings: pricing.savings.toString()
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
      
      // Update the payment details processing with pricing configuration
      const paymentDetails = await step.run("process-payment-details", async () => {
        const subscriptionDuration = parseInt(paymentData?.metadata?.subscription_duration || '180') / 30;
        const pricing = calculateSubscriptionPrice(subscriptionDuration);
        
        return {
          basePrice: pricing.basePrice,
          taxes: pricing.taxes,
          total: pricing.total,
          currency: (paymentData?.currency || 'usd').toUpperCase(),
          duration: pricing.duration,
          savings: pricing.savings,
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
      const emailResult = await step.run("send-invoice-email", async () => {
        const recipientEmail = jobData.company.user.email;
        if (!recipientEmail) {
          throw new Error(`No email found for company: ${jobData.company.id}`);
        }
      
        const startDate = new Date(paymentData.created * 1000);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (paymentDetails.duration * 30));
        const planName = `${paymentDetails.duration} Month Job Posting${paymentDetails.duration > 1 ? 's' : ''}`;
        const emailComponent = PaymentInvoiceEmail({
          companyName: jobData.company.name,
          jobTitle: jobData.jobTitle,
          amount: `${paymentDetails.total} ${paymentDetails.currency}`,
          paymentId: paymentData.id,
          paymentDate: format(new Date(paymentData.created * 1000), "MMMM dd, yyyy"),
          expirationDate: format(endDate, "MMMM dd, yyyy"),
          jobLocation: jobData.location,
          paymentStatus: "Completed",
          jobPostInfo: {
            id: jobData.id,
            status: jobData.status,
            createDate: format(new Date(jobData.createdAt), "MMMM dd, yyyy"),
            activationDate: format(new Date(jobData.activatedAt || Date.now()), "MMMM dd, yyyy")
          },
          paymentDetails: {
            basePrice: `${paymentDetails.basePrice} ${paymentDetails.currency}`,
            taxes: `${paymentDetails.taxes} ${paymentDetails.currency}`,
            total: `${paymentDetails.total} ${paymentDetails.currency}`,
            savings: `${paymentDetails.savings} ${paymentDetails.currency}`,
            duration: `${paymentDetails.duration} months`,
            invoiceNumber: paymentDetails.invoiceNumber,
            billingAddress: paymentDetails.billingAddress,
            paymentMethod: paymentDetails.paymentMethod,
            subscriptionInfo: {
              planName: planName,
      startDate: format(startDate, "MMMM dd, yyyy"),
      endDate: format(endDate, "MMMM dd, yyyy"),
      status: "ACTIVE"
    },
            receiptUrl: paymentDetails.receiptUrl
          }
        });
      
        return await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: [recipientEmail],
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
