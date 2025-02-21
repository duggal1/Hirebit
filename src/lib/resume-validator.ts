import { z } from "zod";

export const ResumeSchema = {
  personalInfo: z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    location: z.string().min(2, "Location is required"),
    portfolio: z.string().url().optional().nullable(),
    github: z.string().url().optional().nullable(),
    linkedin: z.string().url().optional().nullable(),
  }),

  workExperience: z.array(z.object({
    position: z.string().min(2, "Position is required"),
    company: z.string().min(2, "Company is required"),
    startDate: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format"),
    endDate: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format").optional(),
    highlights: z.array(z.string()).min(1, "Add at least one highlight"),
  })),

  projects: z.array(z.object({
    name: z.string().min(2, "Project name is required"),
    description: z.string().min(10, "Add a proper description"),
    url: z.string().url().optional(),
    technologies: z.array(z.string()).min(1, "Add at least one technology"),
    highlights: z.array(z.string()).min(1, "Add at least one highlight"),
  })),

  education: z.array(z.object({
    degree: z.string().min(2, "Degree is required"),
    institution: z.string().min(2, "Institution is required"),
    year: z.number().min(1900).max(new Date().getFullYear()),
    field: z.string().min(2, "Field of study is required"),
  })),

  skills: z.array(z.object({
    name: z.string().min(2, "Skill name is required"),
    category: z.enum(["technical", "soft", "tools"]),
  })),
};

export type ResumeData = {
  personalInfo: z.infer<typeof ResumeSchema.personalInfo>;
  workExperience: z.infer<typeof ResumeSchema.workExperience>;
  projects: z.infer<typeof ResumeSchema.projects>;
  education: z.infer<typeof ResumeSchema.education>;
  skills: z.infer<typeof ResumeSchema.skills>;
};

export function validateResumeSection(
  section: keyof ResumeData,
  data: any
): string[] {
  try {
    ResumeSchema[section].parse(data);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map((e) => e.message);
    }
    return ["Validation failed"];
  }
}