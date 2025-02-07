"use server";

import { z } from "zod";
import { requireUser } from "./utils/hooks";
import { companySchema, jobSchema, jobSeekerSchema } from "./utils/zodSchemas"; 
import { prisma } from "./utils/db";
import { redirect } from "next/navigation";
import { stripe } from "./utils/stripe";
import { jobListingDurationPricing } from "./utils/pricingTiers";
import { revalidatePath } from "next/cache";
import arcjet, { detectBot, shield } from "./utils/arcjet";
import { request } from "@arcjet/next";
import { inngest } from "./utils/inngest/client";
import { Prisma, UserType } from "@prisma/client";
import { auth } from "./utils/auth";
 
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

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com'  // Replace with your actual production domain
  : 'http://localhost:3000';

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

  console.log(validatedData);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      onboardingCompleted: true,
      userType: "COMPANY",
      Company: {
        create: {
          ...validatedData,
        },
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
        }
      }
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
}

export async function createJob(data: z.infer<typeof jobSchema>) {
  const user = await requireUser();

  const validatedData = jobSchema.parse(data);

  const company = await prisma.company.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      user: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
  });

  if (!company?.id) {
    return redirect("/");
  }

  let stripeCustomerId = company.user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.name || undefined,
    });

    stripeCustomerId = customer.id;

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  // Create job post with ACTIVE status and job description
  const jobPost = await prisma.jobPost.create({
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
    },
  });

  // Get price from pricing tiers based on duration
  const pricingTier = jobListingDurationPricing.find(
    (tier) => tier.days === validatedData.listingDuration
  );

  if (!pricingTier) {
    throw new Error("Invalid listing duration selected");
  }

  const session = await stripe.checkout.sessions.create({
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
    metadata: {
      jobId: jobPost.id,
    },
    success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/payment/cancel`,
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  return redirect(session.url);
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

  // Trigger AI evaluation
  await inngest.send({
    name: "application/submitted",
    data: { applicationId: application.id }
  });

  revalidatePath(`/job/${jobId}`);
  return { success: true };
}

// Add the type definitions
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

// Remove the first duplicate submitTest function and evaluateCode function
// Keep only the more complete version

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

  // Store results
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

  // Apply cooldown if failed
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

export type FormState = {
  message: string;
  success: boolean;
}
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

      educationDetails: formData.get('education') ? JSON.parse(formData.get('education') as string) : [],
      education: formData.get('education') ? JSON.parse(formData.get('education') as string) : [],
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') || "",
      jobId: formData.get('jobId') || "",
      about: formData.get('about') as string,
      resume: formData.get('resume') as string,
      location: formData.get('location') as string,
      skills: formData.get('skills') ? JSON.parse(formData.get('skills') as string) : [],
      experience: Number(formData.get('experience')) || 0,
    //  education: formData.get('education') ? JSON.parse(formData.get('education') as string) : [],
      expectedSalaryMin: formData.get('expectedSalaryMin') ? Number(formData.get('expectedSalaryMin')) : null,
      expectedSalaryMax: formData.get('expectedSalaryMax') ? Number(formData.get('expectedSalaryMax')) : null,
      preferredLocation: formData.get('preferredLocation') as string,
      remotePreference: formData.get('remotePreference') as string,
      yearsOfExperience: Number(formData.get('yearsOfExperience')) || 0,
      availabilityPeriod: Number(formData.get('availabilityPeriod')) || 30,
      desiredEmployment: formData.get('desiredEmployment') as string,
      certifications: formData.get('certifications') ? JSON.parse(formData.get('certifications') as string) : null,
      linkedin: formData.get('linkedin') as string || null,
      github: formData.get('github') as string || null,
      portfolio: formData.get('portfolio') as string || null,

    };

    const validatedData = jobSeekerSchema.parse(rawData);

    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        education: validatedData.education as Prisma.JsonArray,
        educationDetails: validatedData.education as Prisma.JsonArray, // Use same data for both fields
        name: validatedData.name,
        about: validatedData.about,
        phoneNumber: validatedData.phoneNumber || null,
        resume: validatedData.resume,
        location: validatedData.location,
        skills: validatedData.skills,
        experience: validatedData.experience,
        //education: validatedData.education as Prisma.JsonArray,
        expectedSalaryMin: validatedData.expectedSalaryMin,
        expectedSalaryMax: validatedData.expectedSalaryMax,
        preferredLocation: validatedData.preferredLocation,
        remotePreference: validatedData.remotePreference,
        yearsOfExperience: validatedData.yearsOfExperience,
        availabilityPeriod: validatedData.availabilityPeriod,
        desiredEmployment: validatedData.desiredEmployment,
        certifications: validatedData.certifications 
          ? (validatedData.certifications as Prisma.JsonArray)
          : Prisma.JsonNull,
        linkedin: validatedData.linkedin,
        github: validatedData.github,
        portfolio: validatedData.portfolio,
        userId: session.user.id // Add this line
       
        }
      
    });

    if (validatedData.jobId && validatedData.jobId.trim() !== "") {
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
      message: 'Profile created successfully!',
      success: true 
    };
  } catch (error) {
    console.error('Server error:', error);
    return { 
      message: error instanceof Error ? error.message : 'Failed to create profile',
      success: false 
    };
  }
};