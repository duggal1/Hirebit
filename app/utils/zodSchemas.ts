import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  about: z
    .string()
    .min(10, "Please provide more information about your company"),
  logo: z.string().min(1, "Please upload a logo"),
  website: z.string().url("Please enter a valid website URL"),
  xAccount: z.string().optional(),
});


export const jobSeekerSchema = z.object({
  name: z.string().min(2),
  about: z.string().min(50),
  resume: z.string().url(),
  location: z.string().min(2),
  expectedSalaryMin: z.number().min(0).nullable(),

  desiredEmployment: z.enum(["Full-time", "Part-time", "Contract"]),
  expectedSalaryMax: z.number().min(0).nullable(),
  preferredLocation: z.string().min(2),
  remotePreference: z.enum(["Remote", "Hybrid", "On-site"]),
  yearsOfExperience: z.number().min(0),
  skills: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
    url: z.string().url().optional()
  })).optional(),
  availabilityPeriod: z.number(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
    fieldOfStudy: z.string()
  })),
  experience: z.number(),
  phoneNumber: z.string().optional().nullable(), // Make phone number optional and nullable
  jobId: z.string().optional().nullable(), // Make jobId optional and nullable
  linkedin: z.string().url("Invalid URL format").optional().or(z.literal("")),
  github: z.string().url("Invalid URL format").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid URL format").optional().or(z.literal("")),

});

export const jobSchema = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  employmentType: z.string().min(1, "Please select an employment type"),
  location: z.string().min(1, "Please select a location"),
  salaryFrom: z.number().min(1, "Salary from is required"),
  salaryTo: z.number().min(1, "Salary to is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  benefits: z.array(z.string()).min(1, "Please select at least one benefit"),
  companyName: z.string().min(1, "Company name is required"),
  companyLocation: z.string().min(1, "Company location is required"),
  companyLogo: z.string().min(1, "Company logo is required"),
  companyWebsite: z.string().min(1, "Company website is required"),
  companyXAccount: z.string().optional(),
  companyDescription: z.string().min(1, "Company description is required"),
  listingDuration: z.number().min(1, "Listing duration is required"),
});
