"use server";

import { prisma } from "@/app/utils/db";
import { ApplicationStatus } from "@prisma/client";
import { requireUser } from "@/app/utils/hooks";

export async function getJobForTest(jobId: string) {
  const user = await requireUser();
  
  // Get the job seeker profile
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    throw new Error("Please complete your profile first");
  }

  const jobPost = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          name: true,
          logo: true
        }
      }
    }
  });

  if (!jobPost) {
    throw new Error("Job not found");
  }

  // Check for existing completed application
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobSeekerId_jobId: {
        jobId: jobId,
        jobSeekerId: jobSeeker.id
      }
    }
  });

  // If there's an existing application that's not pending, prevent retaking
  if (existingApplication && existingApplication.status !== "PENDING") {
    throw new Error("You have already completed this test");
  }

  // If no application exists, create one
  if (!existingApplication) {
    await prisma.jobApplication.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobId: jobId,
        status: "PENDING",
        resume: jobSeeker.resume
      }
    });
  }

  return jobPost;
}

export async function submitTestResults(data: {
  jobId: string;
  code: string;
  results: any[];
  status: ApplicationStatus;
  score: number;
}) {
  const user = await requireUser();
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    throw new Error("Job seeker profile not found");
  }

  try {
    const result = await prisma.jobApplication.update({
      where: {
        jobSeekerId_jobId: {
          jobId: data.jobId,
          jobSeekerId: jobSeeker.id
        }
      },
      data: {
        status: data.status,
        aiScore: data.score,
        answers: data.results,
        resume: data.code
      }
    });

    return result;
  } catch (error) {
    console.error("Test submission error:", error);
    throw new Error("Failed to submit test results");
  }
} 