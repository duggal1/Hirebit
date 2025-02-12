"use strict";
exports.__esModule = true;
exports.resumeSchema = exports.jobSchema = exports.jobSeekerSchema = exports.companySchema = void 0;
var zod_1 = require("zod");
exports.companySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Company name must be at least 2 characters"),
    location: zod_1.z.string().min(2, "Location must be at least 2 characters"),
    about: zod_1.z.string().min(10, "Please provide more information about your company"),
    logo: zod_1.z.string().min(1, "Please upload a logo"),
    website: zod_1.z.string().url("Please enter a valid website URL"),
    xAccount: zod_1.z.string().optional(),
    industry: zod_1.z.string().min(1, "Industry is required"),
    foundedAt: zod_1.z.string().optional(),
    employeeCount: zod_1.z.coerce.number().optional(),
    annualRevenue: zod_1.z.coerce.number().optional(),
    companyType: zod_1.z["enum"](["PRIVATE", "PUBLIC", "NON_PROFIT", "OPEN_SOURCE"]).optional(),
    linkedInUrl: zod_1.z.string().url("Invalid LinkedIn URL").optional(),
    hiringStatus: zod_1.z.boolean().optional()["default"](true),
    glassdoorRating: zod_1.z.coerce.number().optional(),
    techStack: zod_1.z.array(zod_1.z.string()).optional()
});
exports.jobSeekerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    about: zod_1.z.string().min(50),
    resume: zod_1.z.string().url(),
    location: zod_1.z.string().min(2),
    expectedSalaryMin: zod_1.z.number().min(0).nullable(),
    expectedSalaryMax: zod_1.z.number().min(0).nullable(),
    preferredLocation: zod_1.z.string().min(2),
    remotePreference: zod_1.z["enum"](["Remote", "Hybrid", "On-site"]),
    yearsOfExperience: zod_1.z.number().min(0),
    skills: zod_1.z.array(zod_1.z.string()),
    desiredEmployment: zod_1.z["enum"](["Full-time", "Part-time", "Contract"]),
    certifications: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        issuer: zod_1.z.string(),
        year: zod_1.z.number(),
        url: zod_1.z.string().url().optional()
    })).optional(),
    availabilityPeriod: zod_1.z.number(),
    education: zod_1.z.array(zod_1.z.object({
        degree: zod_1.z.string(),
        institution: zod_1.z.string(),
        year: zod_1.z.number(),
        fieldOfStudy: zod_1.z.string()
    })),
    experience: zod_1.z.number(),
    phoneNumber: zod_1.z.string().optional().nullable(),
    jobId: zod_1.z.string().optional().nullable(),
    linkedin: zod_1.z.string().url("Invalid URL format").optional().or(zod_1.z.literal("")),
    github: zod_1.z.string().url("Invalid URL format").optional().or(zod_1.z.literal("")),
    portfolio: zod_1.z.string().url("Invalid URL format").optional().or(zod_1.z.literal("")),
    availableFrom: zod_1.z.string().optional().nullable(),
    previousJobExperience: zod_1.z.any().optional().nullable(),
    willingToRelocate: zod_1.z.boolean().optional().nullable(),
    // Newly added fields
    email: zod_1.z.string().email("Invalid email format"),
    currentJobTitle: zod_1.z.string().min(2).optional().nullable(),
    industry: zod_1.z.string().min(2),
    jobSearchStatus: zod_1.z["enum"](["Actively looking", "Open to offers", "Not looking"])
});
exports.jobSchema = zod_1.z.object({
    jobTitle: zod_1.z.string().min(2, "Job title must be at least 2 characters"),
    employmentType: zod_1.z.string().min(1, "Please select an employment type"),
    location: zod_1.z.string().min(1, "Please select a location"),
    salaryFrom: zod_1.z.number().min(1, "Salary from is required"),
    salaryTo: zod_1.z.number().min(1, "Salary to is required"),
    jobDescription: zod_1.z.string().min(1, "Job description is required"),
    benefits: zod_1.z.array(zod_1.z.string()).min(1, "Please select at least one benefit"),
    companyName: zod_1.z.string().min(1, "Company name is required"),
    companyLocation: zod_1.z.string().min(1, "Company location is required"),
    companyLogo: zod_1.z.string().min(1, "Company logo is required"),
    companyWebsite: zod_1.z.string().url("Invalid URL").min(1, "Company website is required"),
    companyXAccount: zod_1.z.string().optional(),
    companyDescription: zod_1.z.string().min(1, "Company description is required"),
    listingDuration: zod_1.z.number().min(1, "Listing duration is required"),
    skillsRequired: zod_1.z.array(zod_1.z.string()).min(1, "At least one skill is required"),
    positionRequirement: zod_1.z["enum"](["Entry", "Mid", "Senior", "Expert"]),
    requiredExperience: zod_1.z.number().min(0, "Required experience must be at least 0 years"),
    jobCategory: zod_1.z.string().min(1, "Job category is required"),
    interviewStages: zod_1.z.number().min(1, "There must be at least 1 interview stage"),
    visaSponsorship: zod_1.z.boolean(),
    compensationDetails: zod_1.z.any()
});
exports.resumeSchema = zod_1.z.object({
    resumeId: zod_1.z.string().uuid().optional(),
    resumeName: zod_1.z.string().min(2, "Resume name must be at least 2 characters"),
    resumeBio: zod_1.z.string().min(10, "Resume bio must be at least 10 characters"),
    pdfUrlId: zod_1.z.string().url("Invalid PDF URL")
});
