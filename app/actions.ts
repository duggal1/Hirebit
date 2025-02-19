"use server";

import { z } from "zod";
import { requireUser } from "./utils/hooks";
import { prisma } from "./utils/db";
import { redirect } from "next/navigation";
import { stripe } from "./utils/stripe";
import { jobListingDurationPricing } from "./utils/pricingTiers";
import { revalidatePath } from "next/cache";
import arcjet, { detectBot, shield } from "./utils/arcjet";
import { request } from "@arcjet/next";
import { inngest } from "./utils/inngest/client";
import { calculateAndUpdateJobMetrics, updateMetricsWithLocation } from './utils/jobMetrics';
import { Prisma, UserType } from "@prisma/client";
import { auth } from "./utils/auth";
import { companySchema, jobSchema, jobSeekerSchema, resumeSchema } from "./utils/zodSchemas";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator
import { errorHandler } from "./middleware/errorHandler";

const aj = arcjet
  .withRule(
    shield({
      mode: "LIVE",
    })
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  );

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com"
    : "http://localhost:3000";

export async function createCompany(data: z.infer<typeof companySchema>) {
  const user = await requireUser();

  // Access the request object so Arcjet can analyze it
  const req = await request();
  // Call Arcjet protect
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error("Forbidden");
  }

  // Server-side validation
  const validatedData = companySchema.parse(data);

  // Build companyData object with new fields, including generating a unique companyID
  const companyData = {
    companyID: uuidv4(), // Generate unique recruiter-specific companyID
    name: validatedData.name,
    location: validatedData.location,
    about: validatedData.about,
    logo: validatedData.logo,
    website: validatedData.website,
    xAccount: validatedData.xAccount,
    industry: validatedData.industry || "Technology",
    foundedAt: validatedData.foundedAt ? new Date(validatedData.foundedAt) : null,
    employeeCount: validatedData.employeeCount,
    annualRevenue: validatedData.annualRevenue,
    companyType: validatedData.companyType,
    linkedInUrl: validatedData.linkedInUrl,
    hiringStatus: validatedData.hiringStatus,
    glassdoorRating: validatedData.glassdoorRating,
    techStack: validatedData.techStack,
  };

  console.log(companyData);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      onboardingCompleted: true,
      userType: "COMPANY",
      Company: {
        create: companyData,
      },
    },
  });

  return redirect("/");
}

export async function createJobSeeker(data: z.infer<typeof jobSeekerSchema>) {
  const user = await requireUser();

  try {
    const { jobId, ...validatedData } = jobSeekerSchema.parse(data);
    
    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        name: validatedData.name,
        about: validatedData.about,
        resume: validatedData.resume,
        location: validatedData.location,
        skills: validatedData.skills,
        experience: validatedData.experience,
        education: validatedData.education as Prisma.JsonArray,
        expectedSalaryMax: validatedData.expectedSalaryMax,
        preferredLocation: validatedData.preferredLocation,
        remotePreference: validatedData.remotePreference,
        yearsOfExperience: validatedData.yearsOfExperience,
        availabilityPeriod: validatedData.availabilityPeriod,
        desiredEmployment: validatedData.desiredEmployment,
        certifications: validatedData.certifications 
          ? (validatedData.certifications as unknown as Prisma.JsonArray)
          : Prisma.JsonNull,
        phoneNumber: validatedData.phoneNumber,
        linkedin: validatedData.linkedin || null,
        github: validatedData.github || null,
        portfolio: validatedData.portfolio || null,
        user: {
          connect: { id: user.id }
        },
        availableFrom: validatedData.availableFrom,
        previousJobExperience: validatedData.previousJobExperience,
        willingToRelocate: validatedData.willingToRelocate,
        // Required fields
        email: validatedData.email,
        industry: validatedData.industry,
        currentJobTitle: validatedData.currentJobTitle,
        jobSearchStatus: validatedData.jobSearchStatus
      },
    });

    // Create job application if jobId is provided
    if (jobId) {
      await prisma.jobApplication.create({
        data: {
          jobSeekerId: jobSeeker.id,
          jobId: jobId,
          status: "PENDING",
          resume: validatedData.resume
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Server error:', error);
    throw new Error(
      error instanceof z.ZodError 
        ? "Invalid form data" 
        : "Failed to create profile"
    );
  }
}export async function createJob(data: z.infer<typeof jobSchema>) {
  console.log("[createJob] Received data:", data);
  const user = await requireUser();
  console.log("[createJob] Current user:", user);

  // Validate incoming data
  const validatedData = jobSchema.parse(data);
  console.log("[createJob] Validated data:", validatedData);

  // Look up the company associated with the current user
  const company = await prisma.company.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      user: { select: { stripeCustomerId: true } },
    },
  });
  console.log("[createJob] Company record:", company);

  if (!company?.id) {
    console.error("[createJob] No company associated with user");
    throw new Error("No company associated with user");
  }

  let stripeCustomerId = company.user.stripeCustomerId;
  console.log("[createJob] Initial stripeCustomerId:", stripeCustomerId);

  // If no Stripe customer ID, create one
  if (!stripeCustomerId) {
    console.log("[createJob] Creating new Stripe customer for:", user.email);
    try {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
      });
      stripeCustomerId = customer.id;
      console.log("[createJob] New Stripe customer created:", stripeCustomerId);

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
      console.log("[createJob] Updated user with new stripeCustomerId");
    } catch (error) {
      console.error("[createJob] Stripe customer creation failed:", error);
      throw new Error("Failed to create Stripe customer");
    }
  }

  // Create the job post record in the database
  let jobPost;
  try {
    jobPost = await prisma.jobPost.create({
      data: {
        companyId: company.id,
        jobTitle: validatedData.jobTitle,
        employmentType: validatedData.employmentType,
        location: validatedData.location,
        salaryFrom: validatedData.salaryFrom,
        salaryTo: validatedData.salaryTo,
        listingDuration: validatedData.listingDuration,
        benefits: validatedData.benefits,
        jobDescription: validatedData.jobDescription,
        status: "ACTIVE",
        skillsRequired: validatedData.skillsRequired,
        positionRequirement: validatedData.positionRequirement,
        requiredExperience: validatedData.requiredExperience,
        jobCategory: validatedData.jobCategory,
        interviewStages: validatedData.interviewStages,
        visaSponsorship: validatedData.visaSponsorship,
        compensationDetails: validatedData.compensationDetails,
      },
    });
    console.log("[createJob] Created job post:", jobPost);
  } catch (error) {
    console.error("[createJob] Failed to create job post:", error);
    throw new Error("Job post creation failed");
  }

  // Determine pricing based on the job listing duration
  const pricingTier = jobListingDurationPricing.find(
    (tier) => tier.days === validatedData.listingDuration
  );
  console.log("[createJob] Pricing tier selected:", pricingTier);

  if (!pricingTier) {
    console.error("[createJob] Invalid listing duration:", validatedData.listingDuration);
    throw new Error("Invalid listing duration selected");
  }

  // Create a Stripe checkout session for payment
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            product_data: {
              name: `Job Posting - ${pricingTier.days} Days`,
              description: pricingTier.description,
              images: [
                "https://pve1u6tfz1.ufs.sh/f/Ae8VfpRqE7c0gFltIEOxhiBIFftvV4DTM8a13LU5EyzGb2SQ",
              ],
            },
            currency: "USD",
            unit_amount: pricingTier.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { jobId: jobPost.id },
      success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/payment/cancel`,
    });
    console.log("[createJob] Stripe checkout session created:", session);
  } catch (error) {
    console.error("[createJob] Stripe checkout session creation failed:", error);
    throw new Error("Failed to create Stripe checkout session");
  }

  if (!session.url) {
    console.error("[createJob] Stripe session URL missing:", session);
    throw new Error("Failed to create Stripe checkout session");
  }

  console.log("[createJob] Returning redirect URL:", session.url);
  // Instead of redirect(session.url), return the URL so the client can handle the redirect
  return { redirectUrl: session.url };
}

export async function updateJobPost(
  data: z.infer<typeof jobSchema>,
  jobId: string
) {
  const user = await requireUser();

  const validatedData = jobSchema.parse(data);

  await prisma.jobPost.update({
    where: {
      id: jobId,
      company: {
        userId: user.id,
      },
    },
    data: {
      jobDescription: validatedData.jobDescription,
      jobTitle: validatedData.jobTitle,
      employmentType: validatedData.employmentType,
      location: validatedData.location,
      salaryFrom: validatedData.salaryFrom,
      salaryTo: validatedData.salaryTo,
      listingDuration: validatedData.listingDuration,
      benefits: validatedData.benefits,
    },
  });

  return redirect("/my-jobs");
}

export async function deleteJobPost(jobId: string) {
  const user = await requireUser();

  await prisma.jobPost.delete({
    where: {
      id: jobId,
      company: {
        userId: user.id,
      },
    },
  });

  return redirect("/my-jobs");
}

export async function saveJobPost(jobId: string) {
  const user = await requireUser();

  await prisma.savedJobPost.create({
    data: {
      jobId: jobId,
      userId: user.id as string,
    },
  });

  revalidatePath(`/job/${jobId}`);
}

export async function unsaveJobPost(savedJobPostId: string) {
  const user = await requireUser();

  const data = await prisma.savedJobPost.delete({
    where: {
      id: savedJobPostId,
      userId: user.id as string,
    },
    select: {
      jobId: true,
    },
  });

  revalidatePath(`/job/${data.jobId}`);
}

export async function getActiveJobs() {
  const jobs = await prisma.jobPost.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      jobTitle: true,
      jobDescription: true,
      salaryFrom: true,
      salaryTo: true,
      employmentType: true,
      location: true,
      createdAt: true,
      company: {
        select: {
          logo: true,
          name: true,
          about: true,
          location: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log("Active jobs found:", jobs.length);
  return jobs;
}

export async function submitJobApplication(jobId: string, formData: FormData) {
  const user = await requireUser();
  
  // Validate user has completed profile
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      resume: true,
    }
  });

  if (!jobSeeker) {
    throw new Error("Please complete your profile first");
  }

  // Create application
  const application = await prisma.jobApplication.create({
    data: {
      jobSeekerId: jobSeeker.id,
      jobId,
      coverLetter: formData.get("coverLetter") as string,
      resume: jobSeeker.resume,
      status: "PENDING",
    }
  });

 

  // Also update job metrics to trigger Gemini analysis and store metrics data
  await calculateAndUpdateJobMetrics(jobId);

  revalidatePath(`/job/${jobId}`);
  return { success: true };
}


//
// Code Evaluation and Test Functions
//

export interface CodeEvaluation {
  score: number;
  feedback: string;
  correctness: boolean;
  efficiency: "low" | "medium" | "high";
}

export interface TestQuestion {
  question: string;
  starterCode: string;
  testCases: { input: string; output: string }[];
  difficulty: "easy" | "medium" | "hard";
}

export interface GeneratedTest {
  questions: TestQuestion[];
  duration: number;
  skillsTested: string[];
}

async function evaluateCode(code: string, question: any): Promise<CodeEvaluation> {
  try {
    const evaluationRes = await fetch(`${BASE_URL}/api/evaluate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        question: question // Pass the question context
      })
    });

    if (!evaluationRes.ok) throw new Error('Evaluation failed');
    
    return evaluationRes.json();
  } catch (error) {
    console.error('Code evaluation error:', error);
    return { 
      score: 0, 
      feedback: 'Evaluation service unavailable',
      correctness: false,
      efficiency: "low"
    };
  }
}

export async function submitTest(
  jobId: string, 
  data: { code?: string; status: 'completed' | 'cheated' | 'timed_out' }
) {
  const user = await requireUser();

  // Get job details for evaluation context
  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    select: { jobDescription: true }
  });

  if (!job) throw new Error("Job not found");

  // Get the job seeker
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) throw new Error("Job seeker profile not found");

  // Validate test attempt
  const existing = await prisma.jobApplication.findFirst({
    where: {
      jobId,
      jobSeekerId: jobSeeker.id,
      status: { in: ['PENDING', 'ACCEPTED'] }
    }
  });

  if (existing) {
    throw new Error("You've already completed this test");
  }

  // Generate test questions based on job description
  const testRes = await fetch(`${BASE_URL}/api/generate-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription: job.jobDescription })
  });

  const testData = await testRes.json();

  // AI Evaluation
  let score = 0;
  if (data.status === 'completed' && data.code) {
    const evaluation = await evaluateCode(data.code, testData.questions[0]);
    score = evaluation.score;
  }

  // Store results in a new job application record
  const application = await prisma.jobApplication.create({
    data: {
      jobSeeker: {
        connect: { id: jobSeeker.id }
      },
      job: {
        connect: { id: jobId }
      },
      status: data.status === 'completed' ? 
        (score >= 70 ? 'ACCEPTED' : 'REJECTED') : 'REJECTED',
      aiScore: score,
      answers: data.code ? { code: data.code } : undefined,
      resume: jobSeeker.resume
    }
  });

  // If candidate failed, apply cooldown
  if (score < 70) {
    await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: { 
        lastAttemptAt: new Date()
      }
    });
  }

  return { score };
}

function isInCooldown(lastAttemptAt: Date | null): boolean {
  if (!lastAttemptAt) return false;
  const cooldownHours = 24;
  const cooldownEnds = new Date(lastAttemptAt.getTime() + cooldownHours * 60 * 60 * 1000);
  return new Date() < cooldownEnds;
}

export async function trackJobView(jobId: string) {
  "use server";
  try {
    // Update job post views
    await prisma.jobPost.update({
      where: { id: jobId },
      data: { views: { increment: 1 } }
    });

    // Update metrics with location data
    await updateMetricsWithLocation(jobId, 'view')
  } catch (error) {
    console.error('Failed to track job view:', error);
  }
}


export async function trackJobClick(jobId: string) {
  "use server";
  try {
    // Update job post clicks
    await prisma.jobPost.update({
      where: { id: jobId },
      data: { clicks: { increment: 1 } }
    });

    // Update metrics with location data
    await updateMetricsWithLocation(jobId, 'click');
  } catch (error) {
    console.error('Failed to track job click:', error);
  }
}

export async function getJobMetrics(jobId: string) {
  return calculateAndUpdateJobMetrics(jobId);
}

export type FormState = {
  message: string;
  success: boolean;
  // Optional new fields for the job seeker profile:
  availableFrom?: Date;
  previousJobExperience?: any; // Adjust the type if needed (e.g., an array of objects)
  willingToRelocate?: boolean;
};

export const submitJobSeeker = async (
  prevState: FormState,
  formData: FormData
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { 
        message: "You must be logged in to create a profile", 
        success: false 
      };
    }
    
    const rawData = {
      educationDetails: formData.get('education')
        ? JSON.parse(formData.get('education') as string)
        : [],
      education: formData.get('education')
        ? JSON.parse(formData.get('education') as string)
        : [],
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') || "",
      jobId: formData.get('jobId') || "",
      about: formData.get('about') as string,
      resume: formData.get('resume') as string,
      location: formData.get('location') as string,
      skills: formData.get('skills') ? JSON.parse(formData.get('skills') as string) : [],
      experience: Number(formData.get('experience')) || 0,
      expectedSalaryMin: formData.get('expectedSalaryMin')
        ? Number(formData.get('expectedSalaryMin'))
        : null,
      expectedSalaryMax: formData.get('expectedSalaryMax')
        ? Number(formData.get('expectedSalaryMax'))
        : null,
      preferredLocation: formData.get('preferredLocation') as string,
      remotePreference: formData.get('remotePreference') as string,
      yearsOfExperience: Number(formData.get('yearsOfExperience')) || 0,
      availabilityPeriod: Number(formData.get('availabilityPeriod')) || 30,
      desiredEmployment: formData.get('desiredEmployment') as string,
      certifications: formData.get('certifications')
        ? JSON.parse(formData.get('certifications') as string)
        : null,
      linkedin: (formData.get('linkedin') as string) || null,
      github: (formData.get('github') as string) || null,
      portfolio: (formData.get('portfolio') as string) || null,
      availableFrom: formData.get("availableFrom") 
        ? new Date(formData.get("availableFrom") as string).toISOString()
        : null,
      previousJobExperience: formData.get("previousJobExperience") as string || null,
      willingToRelocate: formData.get("willingToRelocate") === "true",
      // New fields
      email: formData.get('email') as string,
      currentJobTitle: formData.get('currentJobTitle') as string || null,
      industry: formData.get('industry') as string,
      jobSearchStatus: formData.get('jobSearchStatus') as "ACTIVELY_LOOKING" | "OPEN_TO_OFFERS" | "NOT_LOOKING"
    };

    const validatedData = jobSeekerSchema.parse(rawData);
    
    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        name: validatedData.name,
        about: validatedData.about,
        resume: validatedData.resume,
        location: validatedData.location,
        skills: validatedData.skills,
        experience: validatedData.experience,
        education: validatedData.education as Prisma.JsonArray,
        expectedSalaryMax: validatedData.expectedSalaryMax,
        preferredLocation: validatedData.preferredLocation,
        remotePreference: validatedData.remotePreference,
        yearsOfExperience: validatedData.yearsOfExperience,
        availabilityPeriod: validatedData.availabilityPeriod,
        desiredEmployment: validatedData.desiredEmployment,
        certifications: validatedData.certifications 
          ? (validatedData.certifications as unknown as Prisma.JsonArray)
          : Prisma.JsonNull,
        phoneNumber: validatedData.phoneNumber,
        linkedin: validatedData.linkedin || null,
        github: validatedData.github || null,
        portfolio: validatedData.portfolio || null,
        availableFrom: validatedData.availableFrom,
        previousJobExperience: validatedData.previousJobExperience,
        willingToRelocate: validatedData.willingToRelocate,
        // New fields
        email: validatedData.email,
        currentJobTitle: validatedData.currentJobTitle,
        industry: validatedData.industry,
        jobSearchStatus: validatedData.jobSearchStatus,
        user: {
          connect: { id: session.user.id }
        }
      },
    });

    // Create job application if jobId is provided
    if (validatedData.jobId) {
      await prisma.jobApplication.create({
        data: {
          jobSeekerId: jobSeeker.id,
          jobId: validatedData.jobId,
          status: "PENDING",
          resume: validatedData.resume
        }
      });
    }

    return { 
      message: "Profile updated successfully!",
      success: true,
      redirect: '/'
    };
  } catch (error) {
    console.error('Server error:', error);
    return { 
      message: error instanceof Error ? error.message : 'Failed to update profile',
      success: false 
    };
  }
};





export const submitJobSeekerResume = async (
  prevState: FormState, // new first parameter (can be ignored if not needed)
  formData: FormData
): Promise<FormState> => {
  const user = await requireUser();
  if (!user?.id) {
    throw new Error("You must be logged in to submit your resume.");
  }

  // Query the JobSeeker record using the logged-in user's ID.
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id },
  });
  if (!jobSeeker || !jobSeeker.id) {
    throw new Error("JobSeeker record not found.");
  }

  // Build a raw resume data object from the formData.
  const resumeDataRaw = {
    // Optionally provided from the client; otherwise, Prisma will generate one.
    resumeId: formData.get("resumeId")?.toString() || undefined,
    resumeName: formData.get("resumeName")?.toString() || "",
    resumeBio: formData.get("resumeBio")?.toString() || "",
    pdfUrlId: formData.get("pdfUrlId")?.toString() || "",
  };

  // Validate the resume data using the Zod schema.
  const parsedResult = resumeSchema.safeParse(resumeDataRaw);
  if (!parsedResult.success) {
    throw new Error(parsedResult.error.message);
  }
  const validResumeData = parsedResult.data;

  // Create the JobSeekerResume record in Prisma.
  try {
    await prisma.jobSeekerResume.create({
      data: {
        ...(validResumeData.resumeId ? { resumeId: validResumeData.resumeId } : {}),
        resumeName: validResumeData.resumeName,
        resumeBio: validResumeData.resumeBio,
        pdfUrlId: validResumeData.pdfUrlId,
        // Note: The JobSeekerResume model does not have a jobSeekerId field.
        // We omit linking here because the schema does not allow it.
      },
    });
  } catch (error) {
    console.error("Error creating JobSeekerResume:", error);
    throw new Error("Failed to create resume record.");
  }

  // After successful storage, redirect the user to the coding test page using the JobSeeker's unique id.
  return redirect(`/coding-test/${jobSeeker.id}`);
};