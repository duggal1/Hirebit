// pages/api/generate-job-content.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { getGeminiGeneratedContent } from "@/app/utils/gemini";

// This API route expects a POST request with a JSON body like { jobData: { ... } }
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract the jobData from the request body
    const { jobData } = req.body;
    if (!jobData) {
      return res.status(400).json({ error: "Missing jobData" });
    }

    // Ensure the user is authenticated and get the current user
    const user = await requireUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch additional company data from Prisma using the authenticated user's ID.
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

    // Construct a prompt for Gemini by merging client job data and company data.
    // Note: jobData is expected to include properties such as:
    //   jobTitle, employmentType, location, salaryFrom, salaryTo, listingDuration,
    //   benefits (array), jobDescription, skillsRequired (array), positionRequirement,
    //   requiredExperience, jobCategory, interviewStages, visaSponsorship, and compensationDetails.
    const prompt = `Generate an enhanced job post description using the following details:

Job Title: ${jobData.jobTitle}
Employment Type: ${jobData.employmentType}
Location: ${jobData.location}
Salary Range: ${jobData.salaryFrom} - ${jobData.salaryTo}
Listing Duration: ${jobData.listingDuration} days
Benefits: ${Array.isArray(jobData.benefits) ? jobData.benefits.join(", ") : jobData.benefits}
Current Description: ${jobData.jobDescription}

Job Requirements:
- Skills Required: ${Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired.join(", ") : jobData.skillsRequired}
- Position Requirement: ${jobData.positionRequirement}
- Required Experience: ${jobData.requiredExperience} years
- Job Category: ${jobData.jobCategory}
- Interview Stages: ${jobData.interviewStages}
- Visa Sponsorship: ${jobData.visaSponsorship ? "Yes" : "No"}
- Compensation Details: ${typeof jobData.compensationDetails === "object" ? JSON.stringify(jobData.compensationDetails) : jobData.compensationDetails}

Company Information:
- Name: ${company?.name || jobData.companyName}
- Location: ${company?.location || jobData.companyLocation}
- Company Type: ${company?.companyType || "Not Specified"}
- Industry: ${company?.industry || "Not Specified"}
- About: ${company?.about || jobData.companyDescription}

Please generate a more appealing, detailed, and engaging job post description that highlights the role's key requirements and the company’s culture.`;

    // Call your Gemini helper function with the prompt.
    const generatedContent = await getGeminiGeneratedContent(prompt);

    // Return the generated content in JSON format.
    return res.status(200).json({ generatedContent });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({ error: "Failed to generate content" });
  }
}
