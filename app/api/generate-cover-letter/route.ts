import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Generate Cover Letter - Request body:", body);
    const { jobSeekerId, companySlug, verificationId } = body;

    // Fetch job seeker data with additional fields from the schema
    console.log("Fetching job seeker data for ID:", jobSeekerId);
    const jobSeeker = await prisma.jobSeeker.findFirst({
      where: { id: jobSeekerId },
      select: {
        id: true,
        name: true,
        about: true,
        skills: true,
        yearsOfExperience: true,
        education: true,
        certifications: true,
        desiredEmployment: true,
        location: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        preferredLocation: true,
        remotePreference: true,
        availabilityPeriod: true,
        resume: true,
        phoneNumber: true,
        linkedin: true,
        github: true,
        portfolio: true,
        experience: true,
      },
    });

    console.log("Job seeker data:", jobSeeker);
    if (!jobSeeker) {
      console.log("Job seeker not found");
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    // Fetch verification (and associated company) data
    console.log("Fetching verification data for ID:", verificationId);
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        company: true,
      },
    });

    console.log("Verification data:", verification);
    if (!verification?.company) {
      console.log("Company not found");
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Parse education and certifications (using the first entry as the latest)
    const education = jobSeeker.education as any[];
    const certifications = jobSeeker.certifications as any[];
    const latestEducation = education?.[0];
    const latestCertification = certifications?.[0];

    // Build additional candidate details if available
    const salaryRange =
      jobSeeker.expectedSalaryMin && jobSeeker.expectedSalaryMax
        ? `$${jobSeeker.expectedSalaryMin} - $${jobSeeker.expectedSalaryMax}`
        : "Not specified";
    const professionalLinks = [
      jobSeeker.linkedin ? `LinkedIn: ${jobSeeker.linkedin}` : "",
      jobSeeker.github ? `GitHub: ${jobSeeker.github}` : "",
      jobSeeker.portfolio ? `Portfolio: ${jobSeeker.portfolio}` : "",
    ]
      .filter((link) => link)
      .join(" | ") || "Not provided";

    // Refined prompt for generating a formal, human-like cover letter with concrete details
    const prompt = `Generate a formal, human-like cover letter for a software engineer application using the following details. The cover letter must be specific, avoid generic buzzwords, and must not include any header information like "[Your Name]", "[Your Address]", or "[Date]".

Candidate Details:
- Name: ${jobSeeker.name}
- Experience: ${jobSeeker.yearsOfExperience} years
- Skills: ${jobSeeker.skills?.join(", ")}
- Education: ${
      latestEducation
        ? `${latestEducation.degree} from ${latestEducation.institution} (${latestEducation.year})`
        : "Not specified"
    }
- Latest Certification: ${
      latestCertification
        ? `${latestCertification.name} (${latestCertification.year})`
        : "Not specified"
    }
- Employment Preference: ${jobSeeker.desiredEmployment}
- Current Location: ${jobSeeker.location} (Preferred Location: ${jobSeeker.preferredLocation})
- Remote Preference: ${jobSeeker.remotePreference}
- Salary Expectation: ${salaryRange}
- Availability: ${jobSeeker.availabilityPeriod} days notice
- Professional Links: ${professionalLinks}
- Background: ${jobSeeker.about}

Company Details:
- Name: ${verification.company.name}
- Industry: ${verification.company.industry}
- About: ${verification.company.about}

Instructions:
1. Write a clear, specific, and formal cover letter that avoids vague or generic buzzwords.
2. Use human-like, natural language and concrete details.
3. Focus on the candidate's real achievements and qualifications.
4. Do not include any header placeholders such as "[Your Name]", "[Your Address]", or "[Date]".
5. Conclude with a call to action inviting further discussion.
6. Maximum length: 400 words.`;

    console.log("Generating cover letter with prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let coverLetter = response.text();

    // Post-process to remove any header-like lines, if they exist
    coverLetter = coverLetter
      .replace(/^\[Your Name\].*$/gm, "")
      .replace(/^\[Your Address\].*$/gm, "")
      .replace(/^\[Date\].*$/gm, "")
      .trim();

    console.log("Generated cover letter successfully");
    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
