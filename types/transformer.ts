// You can place these types in a shared file (e.g. "@/types/transformed.ts") and import them where needed.

export interface TransformedJobApplication {
    id: string;
    status: string;
    coverLetter: string;
    resume: string;
    includeLinks: any;
    answers: any;
    aiScore: number;
    isActive: boolean;
    lastActivity: string;
    createdAt: string;
    updatedAt: string;
    job: {
      id: string;
      title: string;
      employmentType: string;
      status: string;
      location: string;
      salary: {
        from: number;
        to: number;
      };
      applicationData: any;
      aiScore: number;
      isActive: boolean;
      lastActivity: string;
      createdAt: string;
      updatedAt: string;
      requirements: {
        skills: string[];
        experience: number;
        position: string;
      };
      metrics: any;
      codingQuestions: any;
    };
    recruiterData: {
      notes?: string | null;
      feedback?: string | null;
      stage?: string | null;
      lastReviewed?: string | null;
      reviewedBy?: string | null;
    };
    assessment: {
      cultureFitScore: number;
      communicationScore: number;
      technicalSkillsAssessment: number;
      codingTestResults: any;
    };
  }
  
  export interface TransformedResume {
    id: string;
    name: string;
    bio: string;
    pdfUrl: string;
    version: number;
    isActive: boolean;
    keywords: string[];
    parsedData: any;
    recruiterMetrics: {
      views: number;
      lastViewed: string;
      rating: number;
      tags: string[];
    };
    timestamps: {
      created: string;
      updated: string;
    };
  }
  
  export interface TransformedJobSeeker {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    location: string;
    // Here we use 'jobApplications' to store the transformed applications
    jobApplications: TransformedJobApplication[];
    resumes: TransformedResume[];
    // Additional metadata (if needed)
    metadata: {
      createdAt: string;
      updatedAt: string;
      lastAttempt?: string | null;
    };
  }
  