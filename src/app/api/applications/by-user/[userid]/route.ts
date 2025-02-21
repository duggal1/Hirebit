// app/api/applications/by-user/[userId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Await the params before destructuring
  const { userId } = await params;
  console.log("API [by-user] GET: Received request with userId:", userId);

  if (!userId) {
    console.error("User ID is missing in params");
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  try {
    console.log("Looking up JobSeeker with userId:", userId);
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    console.log("JobSeeker lookup result:", jobSeeker);
    if (!jobSeeker) {
      console.error("No JobSeeker found for userId:", userId);
      return NextResponse.json({ error: "JobSeeker not found" }, { status: 404 });
    }
    console.log("Fetching most recent application for JobSeeker id:", jobSeeker.id);
    const application = await prisma.jobApplication.findFirst({
      where: { jobSeekerId: jobSeeker.id },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: {
              select: { name: true, location: true },
            },
          },
        },
      },
    });
    console.log("Application lookup result:", application);
    if (!application) {
      console.log("No application found for JobSeeker id:", jobSeeker.id);
      return NextResponse.json(
        { application: null, message: "No applications found" },
        { status: 200 }
      );
    }
    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error("Error in API /api/applications/by-user:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}
