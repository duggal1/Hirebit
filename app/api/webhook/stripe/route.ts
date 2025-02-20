import { prisma } from "@/app/utils/db";
import { stripe } from "@/app/utils/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = (await headersList).get("Stripe-Signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return new Response("No Stripe signature", { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return new Response("Server configuration error", { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Error verifying webhook signature:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const jobId = paymentIntent.metadata?.jobId;
      
        if (!jobId) {
          console.error("No job ID found in payment intent metadata");
          return new Response("No job ID found", { status: 400 });
        }
      
        try {
          // Log the job status update attempt
          console.log("Updating job status for:", { jobId, paymentIntentId: paymentIntent.id });
      
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
      
          console.log("Job status updated successfully:", {
            jobId,
            newStatus: updatedJob.status,
            paymentStatus: updatedJob.paymentStatus
          });
      
          // Revalidate relevant paths
          revalidatePath('/');
          revalidatePath('/my-jobs');
          revalidatePath(`/job/${jobId}`);
        } catch (error) {
          console.error("Error updating job post:", error);
          return new Response("Failed to update job post", { status: 500 });
        }
        break;
        
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        const failedJobId = failedPayment.metadata?.jobId;

        if (failedJobId) {
          await prisma.jobPost.update({
            where: { id: failedJobId },
            data: { 
              paymentStatus: "FAILED",
              paymentId: failedPayment.id,
            },
          });
        }
        break;

      case "payment_intent.processing":
        const processingPayment = event.data.object as Stripe.PaymentIntent;
        const processingJobId = processingPayment.metadata?.jobId;

        if (processingJobId) {
          await prisma.jobPost.update({
            where: { id: processingJobId },
            data: { 
              paymentStatus: "PROCESSING",
              paymentId: processingPayment.id,
            },
          });
        }
        break;
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      'Webhook handler failed',
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'POST',
    },
  });
}