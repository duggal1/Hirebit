"use server";

import { z } from "zod";
import { requireUser } from "./utils/hooks";
import { companySchema, jobSchema } from "./utils/zodSchemas"; 
import { prisma } from "./utils/db";
import { redirect } from "next/navigation";
import { stripe } from "./utils/stripe";
import { jobListingDurationPricing } from "./utils/pricingTiers";
import { revalidatePath } from "next/cache";
import arcjet, { detectBot, shield } from "./utils/arcjet";
import { request } from "@arcjet/next";
import { inngest } from "./utils/inngest/client";
import { Prisma, UserType } from "@prisma/client";

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

const jobSeekerSchema = z.object({
  name: z.string(),
  about: z.string(),
  resume: z.string(),
  location: z.string(),
  skills: z.array(z.string()),
  experience: z.number(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number()
  }))
});

export async function createJobSeeker(data: z.infer<typeof jobSeekerSchema> & { jobId: string }) {
  const user = await requireUser();

  try {
    // Validate with Zod schema
    const validatedData = jobSeekerSchema.parse(data);
    
    // Create profile
    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        name: validatedData.name,
        about: validatedData.about,
        resume: validatedData.resume,
        location: validatedData.location,
        skills: validatedData.skills,
        experience: Number(validatedData.experience) || 0,
        education: validatedData.education as Prisma.JsonArray,
        user: { connect: { id: user.id } }
      }
    });

    // Create application record
    await prisma.jobApplication.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobId: data.jobId,
        status: "PENDING",
        resume: validatedData.resume
      }
    });

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
      jobDescription: validatedData.jobDescription, // Make sure this is stored
      status: "ACTIVE", // Temporarily set to ACTIVE directly
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
};

export const submitJobSeeker = async (
  prevState: FormState,
  formData: FormData
) => {
  try {
    const rawData = {
      name: formData.get('name') as string,
      about: formData.get('about') as string,
      resume: formData.get('resume') as string,
      location: formData.get('location') as string,
      skills: formData.get('skills') ? JSON.parse(formData.get('skills') as string) : [],
      experience: Number(formData.get('experience')) || 0,
      education: formData.get('education') ? JSON.parse(formData.get('education') as string) : [],
      jobId: formData.get('jobId') as string
    };

    // Validate required fields
    if (!rawData.name || !rawData.about || !rawData.resume || !rawData.location) {
      throw new Error('Please fill in all required fields');
    }

    // Create job seeker with validated data
    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        name: rawData.name,
        about: rawData.about,
        resume: rawData.resume,
        location: rawData.location,
        skills: rawData.skills,
        experience: rawData.experience,
        education: rawData.education as Prisma.JsonArray,
        user: { connect: { id: (await requireUser()).id } }
      }
    });

    // Create job application
    if (rawData.jobId) {
      await prisma.jobApplication.create({
        data: {
          jobSeekerId: jobSeeker.id,
          jobId: rawData.jobId,
          status: "PENDING",
          resume: rawData.resume
        }
      });
    }

    return { message: 'Profile created successfully! Redirecting to coding test...', success: true };
  } catch (error) {
    console.error('Error:', error);
    return { 
      message: error instanceof Error ? error.message : 'Failed to create profile',
      success: false 
    };
  }
};

