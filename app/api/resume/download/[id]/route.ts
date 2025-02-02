import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/utils/auth";
import { prisma } from "@/app/utils/db";
import { generatePDF } from "@/lib/pdf";
import { type Prisma } from "@prisma/client";
import { requireUser } from '@/app/utils/auth';
import { errorHandler } from '@/app/middleware/errorHandler';
import { FONT_FAMILIES } from '@/lib/fonts';

type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    personalInfo: true;
    workExperience: true;
    projects: true;
    education: true;
    skills: true;
  }
}>;

// Type expected by generatePDF
type PDFResume = {
  personalInfo: {
    fullName: string;
    email: string;
    location: string;
    portfolio?: string | null;
    github?: string | null;
    linkedin?: string | null;
  } | null;
  workExperience: Array<{
    position: string;
    company: string;
    location?: string | null;
    startDate: Date;
    endDate?: Date | null;
    current: boolean;
    highlights: string[];
    technologies: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    url?: string | null;
    technologies: string[];
    highlights: string[];
  }>;
  education: Array<{
    degree: string;
    field?: string | null;
    institution: string;
    location?: string | null;
    year: number;
    achievements: string[];
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency?: number | null;
  }>;
};

// Transform database data to PDF format
function transformToPDFFormat(resume: ResumeWithRelations): PDFResume {
  return {
    personalInfo: resume.personalInfo,
    workExperience: resume.workExperience.map(exp => ({
      position: exp.position,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      highlights: exp.highlights,
      technologies: exp.technologies,
    })),
    projects: resume.projects.map(project => ({
      name: project.name,
      description: project.description,
      url: project.url,
      technologies: project.technologies,
      highlights: project.highlights,
    })),
    education: resume.education.map(edu => ({
      degree: edu.degree,
      field: edu.field,
      institution: edu.institution,
      location: edu.location,
      year: edu.year,
      achievements: edu.achievements,
    })),
    skills: resume.skills.map(skill => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    })),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Validate parameters
    const params = await Promise.resolve(context.params);
    const resumeId = params.id;

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await requireUser();

    // Get resume data
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id
      },
      include: {
        personalInfo: true,
        workExperience: true,
        projects: true,
        education: true,
        skills: true,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const pdfBuffer = await generatePDF(resume as PDFResume, {
      font: 'ROBOTO', // Use the enum key directly
      size: 'A4',
      margin: 50
    });

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${resume.personalInfo?.fullName || 'resume'}.pdf"`);
    headers.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });

  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('PDF Generation Error:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (error.message.includes('ENOENT')) {
      return NextResponse.json(
        { error: "Font configuration error - please contact support" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate PDF document" },
      { status: 500 }
    );
  }
} 