export type Resume = {
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