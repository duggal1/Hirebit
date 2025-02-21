import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";

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
    await prisma.newsletterSubscriber.updateMany({
      where: {
        email,
        companyId,
        status: "ACTIVE"
      },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date()
      }
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribed`
    );
  } catch (error) {
    console.error("Newsletter unsubscribe failed:", error);
    return NextResponse.json(
      { error: "Unsubscribe failed" },
      { status: 500 }
    );
  }
}