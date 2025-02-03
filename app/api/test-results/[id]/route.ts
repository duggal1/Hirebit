import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { CodeEvaluationResult } from "@/app/types/dto";
import { ApplicationStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    
    // Get job seeker with applications
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: user.id },
      include: { applications: true }
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    const jobId = params.id;
    const application = jobSeeker.applications.find(
      app => app.jobId === jobId
    );

    if (!application) {
      return NextResponse.json(
        { error: "Test results not found" }, 
        { status: 404 }
      );
    }

    // Validate and parse evaluation data
    let evaluation: CodeEvaluationResult | null = null;
    try {
      evaluation = application.answers as CodeEvaluationResult;
    } catch (e) {
      console.error("Error parsing evaluation data:", e);
      return NextResponse.json(
        { error: "Invalid evaluation data format" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: [evaluation],
      score: application.aiScore,
      status: application.status
    });

  } catch (error) {
    console.error("Error fetching test results:", error);
    return NextResponse.json(
      { error: "Failed to retrieve test results" },
      { status: 500 }
    );
  }
}