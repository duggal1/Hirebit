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
import { Prisma, UserType } from "@prisma/client";
import { auth } from "./utils/auth";
import { companySchema, jobSchema, jobSeekerSchema, resumeSchema } from "./utils/zodSchemas";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

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
}

export async function createJob(data: z.infer<typeof jobSchema>) {
  const user = await requireUser();

  // Validate the incoming data using the updated jobSchema
  const validatedData = jobSchema.parse(data);

  // Look up the company associated with the current user
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

  // If the user doesn't have a Stripe customer ID, create one and update the user record
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.name || undefined,
    });

    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  // Create the job post using the new fields along with the existing ones
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
      skillsRequired: validatedData.skillsRequired,
      positionRequirement: validatedData.positionRequirement,
      requiredExperience: validatedData.requiredExperience,
      jobCategory: validatedData.jobCategory,
      interviewStages: validatedData.interviewStages,
      visaSponsorship: validatedData.visaSponsorship,
      compensationDetails: validatedData.compensationDetails,
    },
  });

  // Determine pricing based on the job listing duration
  const pricingTier = jobListingDurationPricing.find(
    (tier) => tier.days === validatedData.listingDuration
  );

  if (!pricingTier) {
    throw new Error("Invalid listing duration selected");
  }

  // Create a Stripe checkout session for payment
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

export async function trackJobView(jobId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [jobPost, metrics] = await Promise.all([
      prisma.jobPost.update({
        where: { id: jobId },
        data: { views: { increment: 1 } }
      }),
      prisma.jobMetrics.findUnique({
        where: { jobPostId: jobId }
      })
    ]);

    if (!metrics) {
      // Create initial metrics if they don't exist
      await prisma.jobMetrics.create({
        data: {
          jobPostId: jobId,
          totalViews: 1,
          viewsByDate: { [today]: 1 },
          clicksByDate: {},
          locationData: {}
        }
      });
    } else {
      // Update existing metrics
      const viewsByDate = { ...metrics.viewsByDate as any };
      viewsByDate[today] = (viewsByDate[today] || 0) + 1;

      await prisma.jobMetrics.update({
        where: { jobPostId: jobId },
        data: {
          totalViews: { increment: 1 },
          viewsByDate
        }
      });
    }

    revalidatePath(`/job/${jobId}`);
  } catch (error) {
    console.error('Failed to track job view:', error);
  }
}

export async function trackJobClick(jobId: string, location?: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [jobPost, metrics] = await Promise.all([
      prisma.jobPost.update({
        where: { id: jobId },
        data: { clicks: { increment: 1 } }
      }),
      prisma.jobMetrics.findUnique({
        where: { jobPostId: jobId }
      })
    ]);

    if (!metrics) {
      // Create initial metrics
      await prisma.jobMetrics.create({
        data: {
          jobPostId: jobId,
          totalClicks: 1,
          clicksByDate: { [today]: 1 },
          viewsByDate: {},
          locationData: location ? { [location]: 1 } : {}
        }
      });
    } else {
      // Update existing metrics
      const clicksByDate = { ...metrics.clicksByDate as any };
      clicksByDate[today] = (clicksByDate[today] || 0) + 1;

      const locationData = { ...metrics.locationData as any };
      if (location) {
        locationData[location] = (locationData[location] || 0) + 1;
      }

      await prisma.jobMetrics.update({
        where: { jobPostId: jobId },
        data: {
          totalClicks: { increment: 1 },
          clicksByDate,
          locationData
        }
      });
    }

    revalidatePath(`/job/${jobId}`);
  } catch (error) {
    console.error('Failed to track job click:', error);
  }
}
export async function getJobMetrics(jobId: string) {
  const [metrics, applications] = await Promise.all([
    prisma.jobMetrics.findUnique({
      where: { jobPostId: jobId },
      include: {
        jobPost: {
          select: {
            applications: true,
            views: true,
            clicks: true
          }
        }
      }
    }),
    // Get actual submitted applications count
    prisma.jobApplication.count({
      where: {
        jobId,
        status: {
          in: ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED']
        }
      }
    })
  ]);

  if (!metrics) {
    return {
      totalViews: 0,
      totalClicks: 0,
      applications: 0,
      ctr: 0,
      conversionRate: 0,
      viewsByDate: {},
      clicksByDate: {},
      locationData: {}
    };
  }

  // CTR: Clicks divided by Views
  const ctr = metrics.totalViews > 0
    ? (metrics.totalClicks / metrics.totalViews) * 100
    : 0;

  // Conversion Rate: Actual Applications divided by Clicks
  const conversionRate = metrics.totalClicks > 0
    ? (applications / metrics.totalClicks) * 100
    : 0;

  return {
    totalViews: metrics.totalViews,
    totalClicks: metrics.totalClicks,
    applications, // Actual submitted applications
    ctr: Number(ctr.toFixed(2)), // Round to 2 decimal places
    conversionRate: Number(conversionRate.toFixed(2)),
    viewsByDate: metrics.viewsByDate,
    clicksByDate: metrics.clicksByDate,
    locationData: metrics.locationData
  };
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

    const email = formData.get('email') as string;
    
    // First check if a profile already exists with this email
    const existingProfile = await prisma.jobSeeker.findUnique({
      where: { email }
    });
    
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
    
    if (existingProfile) {
      // Update existing profile
      const updatedJobSeeker = await prisma.jobSeeker.update({
      where: { email },
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
        currentJobTitle: validatedData.currentJobTitle,
        industry: validatedData.industry,
        jobSearchStatus: validatedData.jobSearchStatus,
        user: {
        connect: { id: session.user.id }
        }
      },
      });

      return { 
        message: "Profile created successfully!",
      success: true,
      redirect: '/'
      };
    }

    // Create new profile if none exists
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
  prevState: FormState,  // new first parameter (can be ignored if not needed)
  formData: FormData
): Promise<FormState> => {

  const user = await requireUser();
  if (!user?.id) {
    throw new Error("You must be logged in to submit your resume.");
  }

  // Extract the jobId from the formData so we can redirect later.
  // (Assuming the client includes a hidden input named "jobId")
  const jobId = formData.get("jobId")?.toString();
  if (!jobId) {
    throw new Error("Missing jobId in the submitted form data.");
  }

  // Build a raw resume data object from the formData.
  const resumeDataRaw = {
    // Optionally provided from the client, otherwise the prisma default uuid will be used.
    resumeId: formData.get("resumeId")?.toString() || undefined,
    resumeName: formData.get("resumeName")?.toString() || "",
    resumeBio: formData.get("resumeBio")?.toString() || "",
    pdfUrlId: formData.get("pdfUrlId")?.toString() || "",
  };

  // Validate the resume data using the Zod schema.
  const parsedResult = resumeSchema.safeParse(resumeDataRaw);
  if (!parsedResult.success) {
    // You can customize this error handling as needed.
    throw new Error(parsedResult.error.message);
  }
  const validResumeData = parsedResult.data;

  // Create the JobSeekerResume record in Prisma.
  try {
    await prisma.jobSeekerResume.create({
      data: {
        // If resumeId is provided from the client, include it; otherwise Prisma will generate one.
        ...(validResumeData.resumeId ? { resumeId: validResumeData.resumeId } : {}),
        resumeName: validResumeData.resumeName,
        resumeBio: validResumeData.resumeBio,
        pdfUrlId: validResumeData.pdfUrlId,
      },
    });
  } catch (error) {
    console.error("Error creating JobSeekerResume:", error);
    throw new Error("Failed to create resume record.");
  }

  // After successful storage, redirect the user to the coding test page.
  return redirect(`/coding-test/${jobId}`);
}