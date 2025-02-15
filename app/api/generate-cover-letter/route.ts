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

    // Fetch job seeker data with additional useful fields
    console.log("Fetching job seeker data for ID:", jobSeekerId);
    const jobSeeker = await prisma.jobSeeker.findFirst({
      where: { id: jobSeekerId },
      select: {
        id: true,
        name: true,
        currentJobTitle: true,
        industry: true,
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
        availableFrom: true, // NEW FIELD
        previousJobExperience: true, // NEW FIELD
        willingToRelocate: true, // NEW FIELD
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
    let verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        company: true,
      },
    });

    // Fallback: if no verification is found by primary key, try using jobSeekerId.
    if (!verification) {
      console.log(
        "Verification not found by id, trying by jobSeekerId:",
        jobSeekerId
      );
      verification = await prisma.verification.findUnique({
        where: { jobSeekerId },
        include: {
          company: true,
        },
      });
    }

    console.log("Verification data:", verification);
    if (!verification || !verification.company) {
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
    const professionalLinks =
      [
        jobSeeker.linkedin ? `LinkedIn: ${jobSeeker.linkedin}` : "",
        jobSeeker.github ? `GitHub: ${jobSeeker.github}` : "",
        jobSeeker.portfolio ? `Portfolio: ${jobSeeker.portfolio}` : "",
      ]
        .filter((link) => link)
        .join(" | ") || "Not provided";

    // Process additional fields:
    const availableFromStr = jobSeeker.availableFrom
      ? new Date(jobSeeker.availableFrom).toLocaleDateString()
      : "Not specified";
    const relocateStr =
      jobSeeker.willingToRelocate === true ? "Yes" : "No";
    const previousExp =
      jobSeeker.previousJobExperience
        ? typeof jobSeeker.previousJobExperience === "string"
          ? jobSeeker.previousJobExperience
          : JSON.stringify(jobSeeker.previousJobExperience)
        : "Not specified";

    // Fetch resume details (pdf url and resume bio) from JobSeekerResume
    console.log("Fetching resume details for job seeker:", jobSeekerId);
    const jobSeekerResume = await prisma.jobSeekerResume.findFirst({
      where: { resumeId: jobSeeker.resume },
      select: {
        pdfUrlId: true,
        resumeBio: true,
      },
    });
    console.log("Job seeker resume details:", jobSeekerResume);

    // Refined prompt with a highly appealing, straightforward, and formal tone
    const prompt = `Generate a highly appealing and formal cover letter for a software engineer application. The cover letter must be straightforward, direct, and calm—no unnecessary buzzwords or generic phrases.

Candidate Details:
- Name: ${jobSeeker.name}
- Current Job Title: ${jobSeeker.currentJobTitle || "Not specified"}
- Industry: ${jobSeeker.industry || "Not specified"}
- Years of Experience: ${jobSeeker.yearsOfExperience} years
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
- Current Location: ${jobSeeker.location} (Preferred: ${jobSeeker.preferredLocation})
- Remote Preference: ${jobSeeker.remotePreference}
- Salary Expectation: ${salaryRange}
- Availability: ${jobSeeker.availabilityPeriod} days notice (Available from: ${availableFromStr})
- Willing to Relocate: ${relocateStr}
- Previous Job Experience: ${previousExp}
- Professional Links: ${professionalLinks}
- About: ${jobSeeker.about}
- Resume Bio: ${jobSeekerResume?.resumeBio || "Not provided"}
- Resume PDF URL: ${jobSeekerResume?.pdfUrlId || "Not provided"}

Company Details:
- Name: ${verification.company.name}
- Industry: ${verification.company.industry}
- About: ${verification.company.about}

Instructions:
1. Write a highly appealing and formal cover letter that is straightforward and direct.
2. Use a fresh, calm, and honest tone.
3. Avoid any unnecessary buzzwords or generic phrases.
4. Do not include any header placeholders like "[Your Name]", "[Your Address]", or "[Date]".
5. Conclude with a call to action for further discussion.
6. Maximum length: 400 words.
7. please include skills in the application letter and resume bio and pdf url of resume at last `;

    console.log("✔️Generating cover letter with prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let coverLetter = response.text();

    // Post-process to remove any header-like lines, if they exist
    coverLetter = coverLetter
      .replace(/^\[Your Name\].*$/gm, "")
      .replace(/^\[Your Address\].*$/gm, "")
      .replace(/^\[Date\].*$/gm, "")
      .trim();

    console.log("✨✅Generated cover letter successfully");
    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("❌Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
