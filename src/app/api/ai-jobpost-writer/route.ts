import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/src/utils/hooks";
import { getGeminiGeneratedContent } from "@/src/utils/gemini";


import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


export async function POST(req: NextRequest) {
  try {
    // Extract the jobData from the request body
    const body = await req.json();
    const { jobData } = body;
    
    if (!jobData) {
      return NextResponse.json({ error: "Missing jobData" }, { status: 400 });
    }

    // Ensure the user is authenticated and get the current user
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch additional company data from Prisma using the authenticated user's ID
    const company = await prisma.company.findUnique({
      where: { userId: user.id },
      select: {
        name: true,
        location: true,
        companyType: true,
        about: true,
        industry: true,
      },
    });

   const prompt = `Generate a highly detailed job post description in a fresh, calm, formal yet friendly tone.
The job post must follow this exact structure and formatting and MUST begin with the Job Title in a prominent manner, immediately followed by an "Overview" section that introduces the role. Do not start the output with the company name.


Overview

Provide a compelling introduction that explains the role, highlights the company's mission and culture (for example, include statements like "Microsoft’s mission is to empower every person and every organization..."), and outlines why this opportunity is exciting. Ensure that the job title is featured prominently at the very beginning of this section.


Qualifications

List the required qualifications with realistic experience ranges (e.g., "4+ years of experience" or "7+ years of experience") along with required education and technical skills, such as proficiency with C, C++, C#, Java, JavaScript, Python, Docker, and advanced Kubernetes.


Preferred Qualifications

Include additional desirable skills and experiences, along with any extra certifications or advanced technical proficiencies. Also mention specific tools and platforms (e.g., Azure Data Lake, Cosmos DB, Power BI) where relevant.


Compensation & Benefits

Provide a realistic base salary range along with additional perks and benefits. If applicable, include details like bonus amounts, medical benefits, and any other compensation specifics.


Responsibilities

Clearly outline the key responsibilities of the role. Detail the day-to-day tasks and include explicit references to cloud services, databases, frameworks, and other technical tools (for example, Azure Data Lake, Cosmos DB, Power BI, etc.).

Below are the details provided:

--- Job Details ---
Job Title: ${jobData.jobTitle}
Employment Type: ${jobData.employmentType}
Location: ${jobData.location}
Salary Range: ${jobData.salaryFrom} - ${jobData.salaryTo}
Listing Duration: ${jobData.listingDuration} days
Benefits: ${Array.isArray(jobData.benefits) ? jobData.benefits.join(", ") : jobData.benefits}
Current Description: ${jobData.jobDescription}

--- Job Requirements ---
Skills Required: ${Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired.join(", ") : jobData.skillsRequired}
Position Requirement: ${jobData.positionRequirement}
Required Experience: ${jobData.requiredExperience} years (ensure realistic ranges such as "4+ years" or "7+ years" are mentioned)
Job Category: ${jobData.jobCategory}
Interview Stages: ${jobData.interviewStages}
Visa Sponsorship Available: ${jobData.visaSponsorship ? "Yes" : "No"}
Compensation Details: ${typeof jobData.compensationDetails === "object" ? JSON.stringify(jobData.compensationDetails) : jobData.compensationDetails}

--- Company Information ---
Company Name: ${company?.name || jobData.companyName}
Company Location: ${company?.location || jobData.companyLocation}
Company Type: ${company?.companyType || "Not Specified"}
Industry: ${company?.industry || "Not Specified"}
About the Company: ${company?.about || jobData.companyDescription}

Using the above details, generate a complete, engaging, and professionally formatted job post that closely matches the style of a Microsoft job posting. Ensure that the output begins with the job title and overview, and includes explicit company branding, realistic qualification ranges, detailed compensation and benefits, and specific technical responsibilities with references to cloud services and frameworks.
-------------------------------`;


    // Call Gemini helper function with the constructed prompt
    const generatedContent = await getGeminiGeneratedContent(prompt);

    // Return the generated content
    return NextResponse.json({ generatedContent }, { status: 200 });
    
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" }, 
      { status: 500 }
    );
  }
}