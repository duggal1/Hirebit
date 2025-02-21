import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";
import { inngest } from "@/app/utils/inngest/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const companyId = searchParams.get("companyId");

  if (!email || !companyId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Invalid company ID" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existingSubscription = await prisma.newsletterSubscriber.findFirst({
      where: {
        email,
        companyId,
        status: "ACTIVE"
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { message: "Already subscribed" },
        { status: 200 }
      );
    }

    // Add to newsletter subscribers
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        companyId,
        subscribedAt: new Date(),
        status: "ACTIVE"
      }
    });

    // Schedule first newsletter
    await inngest.send({
      name: "newsletter.scheduled",
      data: {
        email,
        companyId,
      },
      delay: "5d"
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/subscribed`
    );
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 }
    );
  }
}