import { prisma } from "@/src/utils/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
    console.log("GET JobSeeker - ID:", id);

    // Directly fetch the jobSeeker by ID
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { 
        id: id 
      },
      include: {
        applications: true
      }
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



