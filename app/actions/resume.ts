'use server';

import { auth } from "@/app/utils/auth";
import { prisma } from "@/app/utils/db";
import { revalidatePath } from "next/cache";
import { generateResumeContent } from "@/lib/gemini";
import { type Prisma } from "@prisma/client";

// Type for resume with all relations
type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    personalInfo: true;
    workExperience: true;
    projects: true;
    education: true;
    skills: true;
  }
}>;

// Type for section data
type SectionData = {
  personalInfo?: Omit<NonNullable<ResumeWithRelations['personalInfo']>, 'id' | 'resumeId' | 'createdAt' | 'updatedAt'>;
  workExperience?: Omit<ResumeWithRelations['workExperience'][number], 'id' | 'resumeId' | 'createdAt' | 'updatedAt'>[];
  projects?: Omit<ResumeWithRelations['projects'][number], 'id' | 'resumeId' | 'createdAt' | 'updatedAt'>[];
  education?: Omit<ResumeWithRelations['education'][number], 'id' | 'resumeId' | 'createdAt' | 'updatedAt'>[];
  skills?: Omit<ResumeWithRelations['skills'][number], 'id' | 'resumeId' | 'createdAt' | 'updatedAt'>[];
};

// Development logging
const logDev = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Resume Builder] ${message}`, data || '');
  }
};

// Helper to get user or throw
async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user;
}

export async function getResume(): Promise<ResumeWithRelations | null> {
  try {
    const user = await requireUser();

    let resume = await prisma.resume.findUnique({
      where: { userId: user.id },
      include: {
        personalInfo: true,
        workExperience: true,
        projects: true,
        education: true,
        skills: true,
      },
    }) as ResumeWithRelations | null;

    // If no resume exists, create one
    if (!resume) {
      const createData: Prisma.ResumeCreateInput = {
        user: {
          connect: { id: user.id }
        },
        personalInfo: {
          create: {
            fullName: user.name || '',
            email: user.email || '',
            location: '',
          }
        }
      };

      resume = await prisma.resume.create({
        data: createData,
        include: {
          personalInfo: true,
          workExperience: true,
          projects: true,
          education: true,
          skills: true,
        },
      }) as ResumeWithRelations;
      logDev('Created new resume', resume);
    }

    logDev('Retrieved resume data', resume);
    return resume;
  } catch (error) {
    logDev('Error fetching resume', error);
    throw new Error('Failed to fetch resume');
  }
}

export async function updateResumeSection(
  section: keyof SectionData,
  data: SectionData[keyof SectionData]
) {
  try {
    const user = await requireUser();
    logDev(`Updating section: ${section}`, data);

    // Get or create resume
    let resume = await prisma.resume.findUnique({
      where: { userId: user.id },
      include: {
        personalInfo: true,
        workExperience: true,
        projects: true,
        education: true,
        skills: true,
      },
    }) as ResumeWithRelations | null;

    if (!resume) {
      // Create initial resume with required fields
      const createData: Prisma.ResumeCreateInput = {
        user: {
          connect: { id: user.id }
        },
        personalInfo: {
          create: {
            fullName: user.name || '',
            email: user.email || '',
            location: '',
          }
        }
      };

      resume = await prisma.resume.create({
        data: createData,
        include: {
          personalInfo: true,
          workExperience: true,
          projects: true,
          education: true,
          skills: true,
        },
      }) as ResumeWithRelations;
      logDev('Created new resume', resume);
    }

    // Update section based on type
    let result;
    switch (section) {
      case 'personalInfo': {
        const personalInfoData = data as SectionData['personalInfo'];
        if (!personalInfoData) break;
        
        result = await prisma.personalInfo.upsert({
          where: { resumeId: resume.id },
          create: { ...personalInfoData, resumeId: resume.id },
          update: personalInfoData,
        });
        break;
      }

      case 'workExperience': {
        const workExperienceData = data as SectionData['workExperience'];
        if (!Array.isArray(workExperienceData)) break;

        await prisma.workExperience.deleteMany({
          where: { resumeId: resume.id },
        });

        result = await prisma.workExperience.createMany({
          data: workExperienceData.map(exp => ({
            ...exp,
            resumeId: resume.id,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          })),
        });
        break;
      }

      case 'projects': {
        const projectData = data as SectionData['projects'];
        if (!Array.isArray(projectData)) break;

        await prisma.project.deleteMany({
          where: { resumeId: resume.id },
        });

        result = await prisma.project.createMany({
          data: projectData.map(project => ({
            ...project,
            resumeId: resume.id,
          })),
        });
        break;
      }

      case 'education': {
        const educationData = data as SectionData['education'];
        if (!Array.isArray(educationData)) break;

        await prisma.education.deleteMany({
          where: { resumeId: resume.id },
        });

        result = await prisma.education.createMany({
          data: educationData.map(edu => ({
            ...edu,
            resumeId: resume.id,
          })),
        });
        break;
      }

      case 'skills': {
        const skillData = data as SectionData['skills'];
        if (!Array.isArray(skillData)) break;

        await prisma.skill.deleteMany({
          where: { resumeId: resume.id },
        });

        result = await prisma.skill.createMany({
          data: skillData.map(skill => ({
            ...skill,
            resumeId: resume.id,
          })),
        });
        break;
      }

      default:
        throw new Error(`Invalid section: ${section}`);
    }

    // Revalidate paths to update UI
    revalidatePath('/resume-builder');
    revalidatePath('/dashboard');
    
    return { success: true, data: result };
  } catch (error) {
    logDev('Error updating section', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update resume' 
    };
  }
}

export async function buildResume(resumeId: string) {
  try {
    const user = await requireUser();
    logDev('Starting resume build process', { resumeId });

    // Get complete resume data
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
    }) as ResumeWithRelations | null;

    if (!resume) throw new Error('Resume not found');

    // Enhanced validation
    if (!resume.personalInfo) {
      throw new Error('Personal information section is incomplete');
    }

    const requiredPersonalFields = ['fullName', 'email'] as const;
    const missingFields = requiredPersonalFields.filter(
      field => {
        const value = resume.personalInfo![field];
        return typeof value === 'string' ? !value.trim() : !value;
      }
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required personal information: ${missingFields.join(', ')}`
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resume.personalInfo.email)) {
      throw new Error('Invalid email format in personal information');
    }

    logDev('Retrieved resume data for building', resume);

    // Generate base content if sections are empty
    const generateBaseContent = async (section: 'workExperience' | 'projects', prompt: string) => {
      try {
        const generated = await generateResumeContent(section, prompt);
        return generated || [];
      } catch (error) {
        logDev(`AI generation failed for ${section}`, error);
        return [];
      }
    };

    // Handle empty sections
    const workExperienceData = resume.workExperience.length > 0 
      ? resume.workExperience
      : await generateBaseContent('workExperience', 
          `Generate 2 professional work experiences for ${resume.personalInfo.fullName} in Software Engineering`
        );

    const projectsData = resume.projects.length > 0
      ? resume.projects
      : await generateBaseContent('projects',
          `Generate 2 technical projects for ${resume.personalInfo.fullName} in Software Engineering`
        );

    // Enhance existing or generated content
    const enhanceSection = async (sectionData: any[], sectionType: 'workExperience' | 'projects') => {
      return Promise.all(
        sectionData.map(async (item) => {
          try {
            const enhanced = await generateResumeContent(sectionType, JSON.stringify(item));
            return enhanced || item;
          } catch (error) {
            logDev(`AI enhancement failed for ${sectionType}`, error);
            return item;
          }
        })
      );
    };

    const enhancedSections = {
      personalInfo: resume.personalInfo,
      workExperience: await enhanceSection(workExperienceData, 'workExperience'),
      projects: await enhanceSection(projectsData, 'projects'),
      education: resume.education,
      skills: resume.skills,
    };

    logDev('Enhanced resume sections', enhancedSections);

    // Helper function to safely parse dates
    const parseDate = (dateStr: string | null | undefined): Date | null => {
      if (!dateStr) return null;
      try {
        // First try parsing as is
        let date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;

        // If that fails, try adding -01 for YYYY-MM format
        if (/^\d{4}-\d{2}$/.test(dateStr)) {
          date = new Date(`${dateStr}-01`);
          if (!isNaN(date.getTime())) return date;
        }

        return null;
      } catch {
        return null;
      }
    };

    // Process and validate work experience data
    const processedWorkExperience = enhancedSections.workExperience
      .flatMap(exp => Array.isArray(exp) ? exp : [exp])
      .filter(exp => exp && exp.position && exp.company)
      .map(exp => {
        const startDate = parseDate(exp.startDate);
        if (!startDate) {
          logDev('Invalid start date', exp);
          return null;
        }

        return {
          position: exp.position,
          company: exp.company,
          startDate,
          endDate: parseDate(exp.endDate),
          highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
          location: exp.location || null
        };
      })
      .filter((exp): exp is NonNullable<typeof exp> => exp !== null);

    // Process and validate project data
    const processedProjects = enhancedSections.projects
      .flatMap(proj => Array.isArray(proj) ? proj : [proj])
      .filter(proj => proj && proj.name && proj.description)
      .map(proj => ({
        name: proj.name,
        description: proj.description,
        url: proj.url || null,
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        highlights: Array.isArray(proj.highlights) ? proj.highlights : []
      }));

    // Update resume with processed data
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        workExperience: {
          deleteMany: {},
          createMany: {
            data: processedWorkExperience
          },
        },
        projects: {
          deleteMany: {},
          createMany: {
            data: processedProjects
          },
        },
      },
      include: {
        personalInfo: true,
        workExperience: true,
        projects: true,
        education: true,
        skills: true,
      },
    });

    // Revalidate paths to update UI
    revalidatePath('/resume-builder');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      data: {
        ...updatedResume,
        downloadUrl: `/api/resume/download/${resumeId}?t=${Date.now()}`
      }
    };
  } catch (error) {
    logDev('Error building resume', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to build resume' 
    };
  }
}

export async function generateResume(resumeId: string) {
  try {
    const result = await buildResume(resumeId);
    if (!result.success) throw new Error(result.error);

    return {
      success: true,
      data: {
        downloadUrl: result.data?.downloadUrl
      }
    };
  } catch (error) {
    logDev('Error generating resume', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate resume'
    };
  }
}