

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    );
  }

  try {
    // First try to find the job seeker
    const jobSeeker = await prisma.jobSeeker.findFirst({
      where: {
        userId: params.id
      }
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    // Then find their most recent application
    const application = await prisma.jobApplication.findFirst({
      where: {
        jobSeekerId: jobSeeker.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "No applications found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
