export interface JobMetrics {
    jobId: string;
    jobTitle: string;
    jobStatus: string;
    metrics: {
      views: number;
      clicks: number;
      applications: number;
      ctr: number;
      conversionRate: number;
      viewsTrend: Record<string, number>;
      clicksTrend: Record<string, number>;
      locationData: Record<string, number>;
      //applicationDetails: ApplicationDetail[];
    };
    createdAt: string;
  }
  
  export interface JobSeekerData {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    currentJobTitle: string;
    industry: string;
    experience: number;
    skills: string[];
    previousExperience: any;
    jobSearchStatus: string;
    expectedSalary: {
      min: number;
      max: number;
    };
    preferences: {
      location: string;
      remote: string;
      relocate: boolean;
      employmentType: string;
    };
    education: any;
    educationDetails: any;
    certifications: any;
    resumes: Array<{
      id: string;
      name: string;
      bio: string;
      pdf: string;
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
    }>;
    applications: Array<{
      id: string;
      status: string;
      job: {
        id: string;
        title: string;
        employmentType: string;
        location: string;
      };
      assessment: {
        aiScore: number;
        cultureFitScore: number;
        communicationScore: number;
        technical: any;
        codingResults: any;
      };
      recruiterData: {
        notes: string;
        feedback: any;
        stage: string;
        lastReviewed: string;
        reviewedBy: string;
      };
      timeline: {
        created: string;
        updated: string;
        lastActivity: string;
      };
    }>;
    links: {
      linkedin: string;
      github: string;
      portfolio: string;
    };
    metadata: {
      createdAt: string;
      updatedAt: string;
      lastAttempt: string;
    };
  }