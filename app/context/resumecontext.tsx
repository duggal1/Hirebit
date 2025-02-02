"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ResumeData as ImportedResumeData, ResumeSchema } from "@/lib/resume-validator";
import { generateResumeContent } from "@/lib/gemini";
import { getResume, updateResumeSection } from "@/app/actions/resume";
import { toast } from "sonner";
import { WorkExperience, Project, Education, Skill, Prisma } from "@prisma/client";

type SkillCategory = 'technical' | 'soft' | 'tools';

type ResumeSection = keyof ImportedResumeData;

interface EducationData {
  degree: string;
  institution: string;
  year: number;
  field: string;
  location?: string;
  achievements?: string[];
}

interface WorkExperienceData {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
  location?: string;
  current?: boolean;
}

interface ProjectData {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
}

interface SkillData {
  name: string;
  category: SkillCategory;
  proficiency?: number;
}

interface PersonalInfoData {
  fullName: string;
  email: string;
  location: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
}

interface LocalResumeData {
  personalInfo: PersonalInfoData;
  workExperience: WorkExperienceData[];
  projects: ProjectData[];
  education: EducationData[];
  skills: SkillData[];
}

interface ResumeContextType {
  resumeData: Partial<LocalResumeData>;
  errors: Record<ResumeSection, string[]>;
  updateSection: (section: ResumeSection, data: any) => Promise<void>;
  generateContent: (section: ResumeSection, prompt: string) => Promise<void>;
  isLoading: boolean;
}

const defaultContext: ResumeContextType = {
  resumeData: {},
  errors: {
    personalInfo: [],
    workExperience: [],
    projects: [],
    education: [],
    skills: []
  },
  updateSection: async () => {},
  generateContent: async () => {},
  isLoading: false
};

const ResumeContext = createContext<ResumeContextType>(defaultContext);

type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    personalInfo: true;
    workExperience: true;
    projects: true;
    education: true;
    skills: true;
  }
}>;

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<Partial<LocalResumeData>>({});
  const [errors, setErrors] = useState<Record<ResumeSection, string[]>>(defaultContext.errors);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial resume data
  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await getResume() as ResumeWithRelations;
        if (data && data.personalInfo) {
          setResumeData({
            personalInfo: {
              fullName: data.personalInfo.fullName,
              email: data.personalInfo.email,
              location: data.personalInfo.location,
              portfolio: data.personalInfo.portfolio || undefined,
              github: data.personalInfo.github || undefined,
              linkedin: data.personalInfo.linkedin || undefined,
            },
            workExperience: data.workExperience.map((exp) => ({
              position: exp.position,
              company: exp.company,
              startDate: exp.startDate.toISOString().substring(0, 7),
              endDate: exp.endDate ? exp.endDate.toISOString().substring(0, 7) : undefined,
              highlights: exp.highlights,
              location: exp.location || undefined,
              current: exp.current || undefined,
            })),
            projects: data.projects.map((proj) => ({
              name: proj.name,
              description: proj.description,
              url: proj.url || undefined,
              technologies: proj.technologies,
              highlights: proj.highlights,
            })),
            education: data.education.map((edu) => ({
              degree: edu.degree,
              institution: edu.institution,
              year: edu.year,
              field: edu.field || '',
              location: edu.location || undefined,
              achievements: edu.achievements || undefined,
            })),
            skills: data.skills.map((skill) => ({
              name: skill.name,
              category: skill.category as SkillCategory,
              proficiency: skill.proficiency || undefined,
            })),
          });
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        toast.error('Failed to load resume data');
      }
    };

    loadResume();
  }, []);

  const updateSection = async (section: ResumeSection, data: any) => {
    try {
      const schema = ResumeSchema[section];
      schema.parse(data);
      
      // Update local state
      setResumeData(prev => ({
        ...prev,
        [section]: data
      }));
      
      setErrors(prev => ({
        ...prev,
        [section]: []
      }));

      // Persist to database
      const result = await updateResumeSection(section, data);
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Resume updated successfully');
    } catch (error) {
      console.error('Error updating resume:', error);
      setErrors(prev => ({
        ...prev,
        [section]: [(error as Error).message]
      }));
      toast.error('Failed to update resume');
    }
  };

  const generateContent = async (section: ResumeSection, prompt: string) => {
    setIsLoading(true);
    try {
      const content = await generateResumeContent(section as "personalInfo" | "workExperience" | "projects", prompt);
      if (content) {
        await updateSection(section, content);
        toast.success('Content generated successfully');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setErrors(prev => ({
        ...prev,
        [section]: ["Failed to generate content"]
      }));
      toast.error('Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        errors,
        updateSection,
        generateContent,
        isLoading
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext);
