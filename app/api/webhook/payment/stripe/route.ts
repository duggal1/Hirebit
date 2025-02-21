import { prisma } from "@/app/utils/db";
import { stripe } from "@/app/utils/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { inngest } from "@/app/utils/inngest/client";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("[Payment Webhook] Missing signature or secret");
      return NextResponse.json(
        { success: false, error: "Configuration error" }, 
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("[Payment Webhook] Event received:", event.type);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { jobId } = paymentIntent.metadata || {};

      if (!jobId) {
        console.error("[Payment Webhook] No jobId in metadata");
        return NextResponse.json(
          { success: false, error: "No job ID found" }, 
          { status: 400 }
        );
      }

      try {
        // 1. Update job status
        const updatedJob = await prisma.jobPost.update({
          where: { id: jobId },
          data: { 
            status: "ACTIVE",
            paidAt: new Date(),
            paymentId: paymentIntent.id,
            paymentStatus: "COMPLETED",
            paymentAmount: paymentIntent.amount,
            invoiceData: {
              paymentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              paidAt: new Date().toISOString(),
              receipt_url: `https://dashboard.stripe.com/payments/${paymentIntent.id}`
            }
          },
        });

        console.log("[Payment Webhook] Job activated:", {
          jobId,
          paymentId: paymentIntent.id,
          status: "ACTIVE"
        });

        // 2. Trigger Inngest event for email
        await inngest.send({
          name: "payment.succeeded",
          data: {
            paymentIntentId: paymentIntent.id,
            jobId: jobId,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        });

        // 3. Revalidate pages
        revalidatePath('/');
        revalidatePath('/my-jobs');
        revalidatePath(`/job/${jobId}`);

        return NextResponse.json({ 
          success: true,
          jobId,
          status: "ACTIVE",
          paymentId: paymentIntent.id
        });

      } catch (error) {
        console.error("[Payment Webhook] Processing error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to process payment" },
          { status: 500 }
        );
      }
    }

    // Handle other payment states
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { jobId } = paymentIntent.metadata || {};

      if (jobId) {
        await prisma.jobPost.update({
          where: { id: jobId },
          data: { 
            status: "DRAFT",
            paymentStatus: "FAILED",
            paymentId: paymentIntent.id
          }
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Payment Webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'POST',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    },
  });
}