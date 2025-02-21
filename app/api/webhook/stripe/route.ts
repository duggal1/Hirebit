import { prisma } from "@/app/utils/db";
import { stripe } from "@/app/utils/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { inngest } from "@/app/utils/inngest/client";

// Define webhook response type for better type safety
interface WebhookResponse {
  success: boolean;
  jobId?: string;
  status?: string;
  error?: string;
}

export async function POST(req: Request) {
  try {
    // Get the raw request body and Stripe signature
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature");

    if (!signature) {
      console.error("[Webhook] No Stripe signature found");
      return new Response(
        JSON.stringify({ success: false, error: "No Stripe signature" }), 
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Webhook secret not configured" }), 
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("[Webhook] Received event:", event.type);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }), 
        { status: 400 }
      );
    }

    // Handle different webhook events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const jobId = paymentIntent.metadata?.jobId;

        if (!jobId) {
          console.error("[Webhook] No jobId in metadata:", paymentIntent.id);
          return new Response(
            JSON.stringify({ success: false, error: "No job ID found" }), 
            { status: 400 }
          );
        }

        try {
          console.log("[Webhook] Processing payment success:", {
            paymentIntentId: paymentIntent.id,
            jobId: jobId,
            amount: paymentIntent.amount
          });

          // Update job status first
          const updatedJob = await prisma.jobPost.update({
            where: { id: jobId },
            data: { 
              status: "ACTIVE",
              paidAt: new Date(),
              paymentId: paymentIntent.id,
              paymentStatus: "COMPLETED",
              paymentAmount: paymentIntent.amount,
            },
          });

          console.log("[Webhook] Job updated:", updatedJob);

          // Trigger Inngest event for email
          const inngestResponse = await inngest.send({
            name: "payment.succeeded",
            data: {
              paymentIntentId: paymentIntent.id,
              jobId: jobId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
              created: paymentIntent.created,
            },
          });

          console.log("[Webhook] Inngest event sent:", inngestResponse);

          // Ensure event processing
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Revalidate cached pages
          revalidatePath('/');
          revalidatePath('/my-jobs');
          revalidatePath(`/job/${jobId}`);

          const response: WebhookResponse = {
            success: true,
            jobId: jobId,
            status: "ACTIVE"
          };

          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("[Webhook] Payment processing error:", error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : "Payment processing failed" 
            }), 
            { status: 500 }
          );
        }
      }

      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        const failedJobId = failedPayment.metadata?.jobId;

        if (failedJobId) {
          await prisma.jobPost.update({
            where: { id: failedJobId },
            data: { 
              status: "DRAFT",
              paymentStatus: "FAILED",
              paymentId: failedPayment.id,
            },
          });

          console.log("[Webhook] Payment failed for job:", failedJobId);
        }
        break;
      }

      case "payment_intent.processing": {
        const processingPayment = event.data.object as Stripe.PaymentIntent;
        const processingJobId = processingPayment.metadata?.jobId;

        if (processingJobId) {
          await prisma.jobPost.update({
            where: { id: processingJobId },
            data: { 
              status: "DRAFT",
              paymentStatus: "PROCESSING",
              paymentId: processingPayment.id,
            },
          });

          console.log("[Webhook] Payment processing for job:", processingJobId);
        }
        break;
      }

      default: {
        console.log("[Webhook] Unhandled event type:", event.type);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("[Webhook] Unhandled error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error" 
      }), 
      { status: 500 }
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