import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== API Request Received ===");
  console.log("Request URL:", request.url);
  
  // Await the dynamic params
  const { id } = await params;
  console.log("Extracted ID from params:", id);

  if (!id) {
    console.error("ID is missing in the request parameters.");
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Attempting to find a job seeker for userId:", id);
    const jobSeeker = await prisma.jobSeeker.findFirst({
      where: {
        userId: id,
      },
    });
    console.log("Job seeker lookup result:", jobSeeker);

    if (!jobSeeker) {
      console.error("Job seeker not found for userId:", id);
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    console.log("Attempting to find the most recent application for jobSeekerId:", jobSeeker.id);
    const application = await prisma.jobApplication.findFirst({
      where: {
        jobSeekerId: jobSeeker.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
    });
    console.log("Job application lookup result:", application);

    if (!application) {
      console.error("No application found for jobSeekerId:", jobSeeker.id);
      return NextResponse.json(
        { error: "No applications found" },
        { status: 404 }
      );
    }

    console.log("Application found successfully:", application);
    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  } finally {
    console.log("Disconnecting Prisma client...");
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  }
}