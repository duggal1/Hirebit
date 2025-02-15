import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";

// Define interface for the verification URLs structure
interface VerificationUrls {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Submit Application - Request body:", body);

    const { jobSeekerId, companySlug, verificationId, coverLetter, includeLinks } = body;

    // 1. Find the verification record (match either by verification id or by jobSeekerId)
    const verification = await prisma.verification.findFirst({
      where: {
        OR: [{ id: verificationId }, { jobSeekerId: jobSeekerId }],
      },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    console.log("Verification data:", verification);

    if (!verification) {
      console.log("Verification not found");
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Type assert the urls object
    const urls = verification.urls as VerificationUrls | null;

    // 2. Find an active job post for the given company
    const jobPost = await prisma.jobPost.findFirst({
      where: {
        company: { name: companySlug },
        status: "ACTIVE",
      },
    });

    if (!jobPost) {
      return NextResponse.json(
        { error: "No active job posts found for this company" },
        { status: 404 }
      );
    }

    // 3. Check if an application already exists for this job post (update scenario)
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { jobSeekerId_jobId: { jobSeekerId, jobId: jobPost.id } },
    });

    // 4. If no existing application, count how many applications this user has submitted
    if (!existingApplication) {
      const applicationCount = await prisma.jobApplication.count({
        where: { jobSeekerId: jobSeekerId },
      });
      if (applicationCount >= 3) {
        return NextResponse.json(
          { error: "Buy Hirebit Premium to unlock unlimited applications to get your dream job" },
          { status: 400 }
        );
      }
    }

    // 5. Upsert the job application (update if exists, or create a new one)
    const application = await prisma.jobApplication.upsert({
      where: { jobSeekerId_jobId: { jobSeekerId, jobId: jobPost.id } },
      update: {
        coverLetter: coverLetter || "",
        status: "PENDING",
        includeLinks,
        resume: verification.jobSeeker?.resume || "",
        answers: includeLinks
          ? {
              linkedin: urls?.linkedin || "",
              github: urls?.github || "",
              portfolio: urls?.portfolio || "",
              skills: verification.jobSeeker?.skills || [],
              experience: verification.jobSeeker?.experience || 0,
              yearsOfExperience: verification.jobSeeker?.yearsOfExperience || 0,
              expectedSalaryMin: verification.jobSeeker?.expectedSalaryMin || null,
              expectedSalaryMax: verification.jobSeeker?.expectedSalaryMax || null,
              certifications: verification.jobSeeker?.certifications || null,
              education: verification.jobSeeker?.education || null,
              location: verification.jobSeeker?.location || "",
              phoneNumber: verification.jobSeeker?.phoneNumber || "",
              desiredEmployment: verification.jobSeeker?.desiredEmployment || "",
            }
          : undefined,
      },
      create: {
        jobSeeker: { connect: { id: jobSeekerId } },
        job: { connect: { id: jobPost.id } },
        coverLetter: coverLetter || "",
        status: "PENDING",
        includeLinks,
        resume: verification.jobSeeker?.resume || "",
        answers: includeLinks
          ? {
              linkedin: urls?.linkedin || "",
              github: urls?.github || "",
              portfolio: urls?.portfolio || "",
              skills: verification.jobSeeker?.skills || [],
              experience: verification.jobSeeker?.experience || 0,
              yearsOfExperience: verification.jobSeeker?.yearsOfExperience || 0,
              expectedSalaryMin: verification.jobSeeker?.expectedSalaryMin || null,
              expectedSalaryMax: verification.jobSeeker?.expectedSalaryMax || null,
              certifications: verification.jobSeeker?.certifications || null,
              education: verification.jobSeeker?.education || null,
              location: verification.jobSeeker?.location || "",
              phoneNumber: verification.jobSeeker?.phoneNumber || "",
              desiredEmployment: verification.jobSeeker?.desiredEmployment || "",
            }
          : undefined,
      },
    });

    // 6. Update job metrics (upsert so we create metrics if they don't exist)
    await prisma.jobMetrics.upsert({
      where: { jobPostId: jobPost.id },
      create: {
        jobPostId: jobPost.id,
        totalViews: 0,
        totalClicks: 0,
        applications: 1,
        viewsByDate: {},
        clicksByDate: {},
        locationData: verification.jobSeeker?.location
          ? { [verification.jobSeeker.location]: 1 }
          : {},
      },
      update: {
        applications: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
