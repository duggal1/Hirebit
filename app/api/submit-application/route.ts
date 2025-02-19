import { prisma } from "@/app/utils/db";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// Define interfaces for better type safety
interface VerificationUrls {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

interface ApplicationAnswers {
  // Professional Links
  linkedin: string;
  github: string;
  portfolio: string;
  
  // Core Professional Info
  currentJobTitle?: string;
  industry?: string;
  jobSearchStatus?: string;
  skills: string[];
  experience: number;
  yearsOfExperience: number;
  
  // Location & Availability
  location: string;
  preferredLocation?: string;
  remotePreference?: string;
  willingToRelocate?: boolean;
  availabilityPeriod?: number;
  availableFrom?: Date;
  
  // Contact & Personal Info
  phoneNumber: string;
  desiredEmployment: string;
  
  // Compensation
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  
  // Qualifications
  certifications: {
    url: string;
    name: string;
    year: number;
    issuer: string;
  }[] | null;
  education: {
    year: number;
    degree: string;
    institution: string;
    fieldOfStudy: string;
  }[] | null;
  
  // Work History
  previousJobExperience?: {
    company: string;
    position: string;
    duration: string;
    highlights: string[];
  }[] | null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Submit Application - Request body:", body);

    const { jobSeekerId, companySlug, verificationId, coverLetter, includeLinks } = body;

    // 1. Find the verification record
    const verification = await prisma.verification.findFirst({
      where: {
        OR: [{ id: verificationId }, { jobSeekerId: jobSeekerId }],
      },
      include: {
        jobSeeker: {
          include: {
            JobSeekerResume: {
              where: {
                isActive: true
              },
              select: {
                resumeName: true,
                resumeBio: true,
                pdfUrlId: true
              }
            }
          }
        },
        company: true,
      },
    });


    const resumeData = verification?.jobSeeker?.JobSeekerResume?.[0];


    if (!verification) {
      console.log("Verification not found");
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    const urls = verification.urls as VerificationUrls | null;

    // 2. Find active job post
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

    // 3. Check existing application
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { jobSeekerId_jobId: { jobSeekerId, jobId: jobPost.id } },
    });

    // 4. Check application limit for non-premium users
    if (!existingApplication) {
      const applicationCount = await prisma.jobApplication.count({
        where: { jobSeekerId: jobSeekerId },
      });
      if (applicationCount >= 3) {
        return NextResponse.json(
          { error: "Buy Hirebit Premium to unlock unlimited applications" },
          { status: 400 }
        );
      }
    }
   
   
    // 5. Prepare application data
    const baseApplicationData = {
      coverLetter: coverLetter || "",
      status: ApplicationStatus.PENDING,
      includeLinks,
      resume: verification.jobSeeker?.resume || "",
      lastActivity: new Date(),
      isActive: true,

      // Handle JSON fields properly for Prisma
      answers: includeLinks ? {
        set: {
          linkedin: urls?.linkedin || "",
          resumeData: resumeData ? {
            resumeName: resumeData.resumeName,
            resumeBio: resumeData.resumeBio,
            pdfUrlId: resumeData.pdfUrlId
          } : null,
          github: urls?.github || "",
          portfolio: urls?.portfolio || "",
          currentJobTitle: verification.jobSeeker?.currentJobTitle || "",
          industry: verification.jobSeeker?.industry || "",
          jobSearchStatus: verification.jobSeeker?.jobSearchStatus || "OPEN_TO_OFFERS",
          skills: verification.jobSeeker?.skills || [],
          experience: verification.jobSeeker?.experience || 0,
          yearsOfExperience: verification.jobSeeker?.yearsOfExperience || 0,
          location: verification.jobSeeker?.location || "",
          preferredLocation: verification.jobSeeker?.preferredLocation || "",
          remotePreference: verification.jobSeeker?.remotePreference || "",
          willingToRelocate: verification.jobSeeker?.willingToRelocate || false,
          availabilityPeriod: verification.jobSeeker?.availabilityPeriod || 0,
          availableFrom: verification.jobSeeker?.availableFrom || null,
          phoneNumber: verification.jobSeeker?.phoneNumber || "",
          desiredEmployment: verification.jobSeeker?.desiredEmployment || "",
          expectedSalaryMin: verification.jobSeeker?.expectedSalaryMin || null,
          expectedSalaryMax: verification.jobSeeker?.expectedSalaryMax || null,
          certifications: verification.jobSeeker?.certifications || null,
          education: verification.jobSeeker?.education || null,
          previousJobExperience: verification.jobSeeker?.previousJobExperience || null,
        }
      } : undefined,

      // Handle other JSON fields
      certifications: verification.jobSeeker?.certifications ? {
        set: verification.jobSeeker.certifications
      } : Prisma.JsonNull,

      education: verification.jobSeeker?.education ? {
        set: verification.jobSeeker.education
      } : Prisma.JsonNull,

      // Scalar fields
      expectedSalaryMin: verification.jobSeeker?.expectedSalaryMin || null,
      expectedSalaryMax: verification.jobSeeker?.expectedSalaryMax || null,
      location: verification.jobSeeker?.location || null,
      phoneNumber: verification.jobSeeker?.phoneNumber || null,
      desiredEmployment: verification.jobSeeker?.desiredEmployment || null,

      // Application tracking fields
      applicationStage: "INITIAL_REVIEW",
      interviewFeedback: Prisma.JsonNull,
      recruiterNotes: null,
      lastReviewedAt: null,
      reviewedBy: null,
      codingTestResults: Prisma.JsonNull,
      technicalSkillsAssessment: Prisma.JsonNull,
      cultureFitScore: null,
      communicationScore: null,
    };

    // 6. Upsert application
    const application = await prisma.jobApplication.upsert({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId,
          jobId: jobPost.id
        }
      },
      update: baseApplicationData,
      create: {
        ...baseApplicationData,
        jobSeeker: {
          connect: { id: jobSeekerId }
        },
        job: {
          connect: { id: jobPost.id }
        },
        ...(jobPost.companyId ? {
          company: {
            connect: { id: jobPost.companyId }
          }
        } : {})
      }
    });



    // 7. Update job metrics
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
          ? JSON.stringify({ [verification.jobSeeker.location]: 1 })
          : "{}",
      },
      update: {
        applications: { increment: 1 },
        locationData: verification.jobSeeker?.location
          ? JSON.stringify({
              [verification.jobSeeker.location]: 1,
            })
          : undefined,
      },
    });

    return NextResponse.json({ 
      success: true, 
      applicationId: application.id,
      status: application.status,
      submittedAt: application.lastActivity // Changed from lastActivityDate
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}