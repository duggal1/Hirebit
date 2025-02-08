export interface LinkedInProfile {
    name?: string;
    location?: string;
    activity?: {
      lastActive: string;
      connectionCount?: string;
      postFrequency?: string;
    };
    isVerified: boolean;
    validationDetails: {
      isValid: boolean;
      profileExists: boolean;
      message: string;
    };
  }