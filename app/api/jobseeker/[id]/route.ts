import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("GET JobSeeker - Verification ID:", id);

    // Fetch the verification record by its id
    const verification = await prisma.verification.findUnique({
      where: { id },
    });

    console.log("GET JobSeeker - Verification:", verification);

    if (!verification) {
      console.log("GET JobSeeker - Verification not found");
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    // Fetch the most recently created jobSeeker with all fields
    // and include its related applications
    const jobSeeker = await prisma.jobSeeker.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        applications: true,
      },
    });

    console.log("GET JobSeeker - Found:", jobSeeker);

    if (!jobSeeker) {
      console.log("GET JobSeeker - Not found");
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobSeeker);
  } catch (error) {
    console.error("Error fetching job seeker:", error);
    return NextResponse.json(
      { error: "Failed to fetch job seeker" },
      { status: 500 }
    );
  }
}
