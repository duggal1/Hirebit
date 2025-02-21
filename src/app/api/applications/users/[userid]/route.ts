

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userid: string } }
) {
  if (!params?.userid) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    // First find the job seeker using the user ID
    const jobSeeker = await prisma.jobSeeker.findFirst({
      where: {
      userId: params.userid
      }
    });

    if (!jobSeeker) {
      return NextResponse.json(
      { error: "Job seeker not found" },
      { status: 404 }
      );
    }

    // Then find all their applications
    const applications = await prisma.jobApplication.findMany({
      where: {
      jobSeekerId: jobSeeker.id
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      active: applications.filter(app => app.isActive).length
    };

    return NextResponse.json({ applications, stats });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
