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

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      console.log("Payment successful, processing webhook...");
      const customerId = session.customer as string;
      const jobId = session.metadata?.jobId;

      if (!jobId) {
        console.error("No job ID found in session metadata");
        return new Response("No job ID found", { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: {
          stripeCustomerId: customerId,
        },
      });

      if (!user) {
        console.error("User not found for customer:", customerId);
        return new Response("User not found", { status: 404 });
      }

      console.log(`Updating job ${jobId} to ACTIVE status...`);
      
      try {
        // Update the job post status to ACTIVE
        const updatedJob = await prisma.jobPost.update({
          where: {
            id: jobId,
          },
          data: {
            status: "ACTIVE",
          },
        });

        console.log("Job updated successfully:", updatedJob);
        
        // Revalidate the jobs page to show the new active job
        revalidatePath('/');
        
        return new Response(null, { status: 200 });
      } catch (error) {
        console.error("Error updating job status:", error);
        return new Response("Error updating job status", { status: 500 });
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { status: 500 }
    );
  }
}
