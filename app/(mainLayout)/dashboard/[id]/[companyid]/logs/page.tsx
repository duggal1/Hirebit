'use client';

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

// Shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Utility function to format dates
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

/* ============================================================
   TYPE DEFINITIONS
============================================================ */

// Base JobSeeker interface from your Prisma model.
interface JobSeeker {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location: string;
  currentJobTitle?: string;
  industry?: string;
  jobSearchStatus?: string;
  yearsOfExperience: number;
  about: string;
  experience: number;
  previousJobExperience: string;
  certifications?: any[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  preferredLocation?: string;
  remotePreference?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills: string[];
  education: any;
  educationDetails?: any;
  desiredEmployment: string;
  willingToRelocate?: boolean;
  availabilityPeriod: number;
  availableFrom?: string;
  JobSeekerResume: any[];
  applications: any[]; // original field (not used on client)
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
}

// Structure of a transformed job application from your API.
interface TransformedJobApplication {
  id: string;
  status: string;
  coverLetter: string;
  resume: string;
  includeLinks?: any;
  answers?: any;
  aiScore?: number;
  isActive: boolean;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    jobTitle: string;
    employmentType: string;
    status: string;
    location: string;
    salary: {
      from: number;
      to: number;
    };
  };
  recruiterData?: {
    notes?: string;
    stage?: string;
    feedback?: string;
    lastReviewed?: string;
    reviewedBy?: string;
  };
  assessment?: {
    cultureFitScore?: number;
    communicationScore?: number;
    technicalSkillsAssessment?: number;
    codingTestResults?: any;
  };
}

// Our API transforms each JobSeeker so that the original 'applications'
// property is replaced with a new property called 'jobApplications'.
interface TransformedJobSeeker extends Omit<JobSeeker, "applications"> {
  jobApplications: TransformedJobApplication[];
}

// Flattened structure for rendering on the Logs page, including extra candidate fields.
interface JobApplicationLog {
  // Application Info
  applicationId: string;
  status: string;
  coverLetter: string;
  resume: string;
  aiScore?: number;
  isActive: boolean;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  // Job Details
  jobId: string;
  jobTitle: string;
  employmentType: string;
  jobStatus: string;
  jobLocation: string;
  salaryFrom: number;
  salaryTo: number;
  // Recruiter Info
  recruiterNotes?: string;
  recruiterStage?: string;
  recruiterFeedback?: string;
  lastReviewed?: string;
  reviewedBy?: string;
  // Assessment
  cultureFitScore?: number;
  communicationScore?: number;
  technicalSkillsAssessment?: number;
  codingTestResults?: any;
  // Candidate (Job Seeker) Info – extra details
  seekerName: string;
  seekerEmail: string;
  seekerPhoneNumber?: string;
  seekerLocation: string;
  seekerCurrentJobTitle?: string;
  seekerIndustry?: string;
  seekerJobSearchStatus?: string;
  seekerYearsOfExperience: number;
  seekerAbout: string;
  seekerExperience: number;
  seekerPreviousJobExperience: string;
  seekerSkills: string[];
  seekerCertifications?: any[];
  seekerExpectedSalaryMin: number | null;
  seekerExpectedSalaryMax: number | null;
  seekerPreferredLocation?: string;
  seekerRemotePreference?: string;
  seekerDesiredEmployment?: string;
  seekerWillingToRelocate?: boolean;
  seekerLinkedin?: string;
  seekerGithub?: string;
  seekerPortfolio?: string;
  seekerEducation?: any;
  seekerEducationDetails?: any;
  seekerAvailabilityPeriod: number;
  seekerAvailableFrom?: string;
  seekerLastAttemptAt?: string;
}

/* ============================================================
   RECRUITER LOGS PAGE COMPONENT
============================================================ */

export default function RecruiterLogsPage() {
  const params = useParams();
  const companyid = params.companyid as string;
  const recruiterId = params.id as string;
  const router = useRouter();

  // Fetch logs data from your API.
  const { data: logsData, isLoading, error } = useQuery<TransformedJobSeeker[]>({
    queryKey: ["dashboardLogs", companyid],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${companyid}/logs`);
      if (!response.ok) {
        throw new Error("Error fetching logs data");
      }
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Flatten the logs so that each job application includes all candidate details.
  const flattenedLogs: JobApplicationLog[] = useMemo(() => {
    if (!logsData) return [];
    const apps: JobApplicationLog[] = [];
    logsData.forEach((seeker) => {
      seeker.jobApplications.forEach((app: TransformedJobApplication) => {
        apps.push({
          // Application Info
          applicationId: app.id,
          status: app.status,
          coverLetter: app.coverLetter,
          resume: app.resume,
          aiScore: app.aiScore,
          isActive: app.isActive,
          lastActivity: app.lastActivity,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          // Job Details
          jobId: app.job.id,
          jobTitle: app.job.jobTitle,
          employmentType: app.job.employmentType,
          jobStatus: app.job.status,
          jobLocation: app.job.location,
          salaryFrom: app.job.salary.from,
          salaryTo: app.job.salary.to,
          // Recruiter Info
          recruiterNotes: app.recruiterData?.notes,
          recruiterStage: app.recruiterData?.stage,
          recruiterFeedback: app.recruiterData?.feedback,
          lastReviewed: app.recruiterData?.lastReviewed,
          reviewedBy: app.recruiterData?.reviewedBy,
          // Assessment
          cultureFitScore: app.assessment?.cultureFitScore,
          communicationScore: app.assessment?.communicationScore,
          technicalSkillsAssessment: app.assessment?.technicalSkillsAssessment,
          codingTestResults: app.assessment?.codingTestResults,
          // Candidate Info – extra fields
          seekerName: seeker.name,
          seekerEmail: seeker.email,
          seekerPhoneNumber: seeker.phoneNumber,
          seekerLocation: seeker.location,
          seekerCurrentJobTitle: seeker.currentJobTitle,
          seekerIndustry: seeker.industry,
          seekerJobSearchStatus: seeker.jobSearchStatus,
          seekerYearsOfExperience: seeker.yearsOfExperience,
          seekerAbout: seeker.about,
          seekerExperience: seeker.experience,
          seekerPreviousJobExperience: seeker.previousJobExperience,
          seekerSkills: seeker.skills,
          seekerCertifications: seeker.certifications,
          seekerExpectedSalaryMin: seeker.expectedSalaryMin,
          seekerExpectedSalaryMax: seeker.expectedSalaryMax,
          seekerPreferredLocation: seeker.preferredLocation,
          seekerRemotePreference: seeker.remotePreference,
          seekerDesiredEmployment: seeker.desiredEmployment,
          seekerWillingToRelocate: seeker.willingToRelocate,
          seekerLinkedin: seeker.linkedin,
          seekerGithub: seeker.github,
          seekerPortfolio: seeker.portfolio,
          seekerEducation: seeker.education,
          seekerEducationDetails: seeker.educationDetails,
          seekerAvailabilityPeriod: seeker.availabilityPeriod,
          seekerAvailableFrom: seeker.availableFrom,
          seekerLastAttemptAt: seeker.lastAttemptAt,
        });
      });
    });
    return apps;
  }, [logsData]);

  // Dummy handlers for Accept/Reject actions.
  const handleAccept = (applicationId: string) => {
    console.log("Accept application:", applicationId);
    // TODO: Implement PATCH request to update application status.
  };

  const handleReject = (applicationId: string) => {
    console.log("Reject application:", applicationId);
    // TODO: Implement PATCH request to update application status.
  };

  // Helper function: render a label/value pair only if the value is non-empty.
  const renderIfNotEmpty = (label: string, value: any) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return null;
    }
    return (
      <p className="my-1">
        <strong>{label}:</strong>{" "}
        {typeof value === "object" && !React.isValidElement(value)
          ? JSON.stringify(value, null, 2)
          : value}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <header className="sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between mb-10 bg-gray-800 bg-opacity-90 p-4 rounded-md shadow-lg">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Recruiter Logs</h1>
          <p className="text-gray-300">
            Manage and review all job applications in an ultra-modern interface.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </header>

      {isLoading && (
        <p className="text-center py-10">Loading job applications...</p>
      )}
      {error && (
        <p className="text-center text-red-500 py-10">
          Error loading logs: {(error as Error).message}
        </p>
      )}
      {!isLoading && !error && flattenedLogs.length === 0 && (
        <p className="text-center py-10">No job applications found.</p>
      )}

      <ScrollArea className="max-h-[calc(100vh-150px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <div className="grid gap-6">
          {flattenedLogs.map((log) => (
            <Card
              key={log.applicationId}
              className="bg-gray-900 border border-gray-700 shadow-2xl transition-transform duration-300 hover:-translate-y-2"
            >
              <CardHeader>
                <CardTitle className="text-xl">
                  {log.jobTitle}{" "}
                  <span className="text-sm text-gray-400">
                    ({log.employmentType})
                  </span>
                </CardTitle>
                <p className="text-gray-400">
                  Applied on: {formatDate(log.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                {/* Application Info */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Application Info</h2>
                  {renderIfNotEmpty("Status", log.status)}
                  {renderIfNotEmpty("Cover Letter", log.coverLetter)}
                  {renderIfNotEmpty(
                    "Resume",
                    log.resume ? (
                      <a
                        href={log.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        View Resume
                      </a>
                    ) : "N/A"
                  )}
                  {renderIfNotEmpty("AI Score", log.aiScore)}
                  {renderIfNotEmpty(
                    "Last Activity",
                    log.lastActivity ? formatDate(log.lastActivity) : null
                  )}
                  {renderIfNotEmpty("Created At", formatDate(log.createdAt))}
                  {renderIfNotEmpty("Last Updated", formatDate(log.updatedAt))}
                </div>

                {/* Job Details */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Job Details</h2>
                  {renderIfNotEmpty("Job Location", log.jobLocation)}
                  {renderIfNotEmpty(
                    "Salary Range",
                    `$${log.salaryFrom} - $${log.salaryTo}`
                  )}
                </div>

                {/* Recruiter Info */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Recruiter Info</h2>
                  {renderIfNotEmpty("Notes", log.recruiterNotes)}
                  {renderIfNotEmpty("Stage", log.recruiterStage)}
                  {renderIfNotEmpty("Feedback", log.recruiterFeedback)}
                  {renderIfNotEmpty(
                    "Last Reviewed",
                    log.lastReviewed ? formatDate(log.lastReviewed) : null
                  )}
                  {renderIfNotEmpty("Reviewed By", log.reviewedBy)}
                </div>

                {/* Assessment */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Assessment</h2>
                  {renderIfNotEmpty("Culture Fit Score", log.cultureFitScore)}
                  {renderIfNotEmpty("Communication Score", log.communicationScore)}
                  {renderIfNotEmpty(
                    "Technical Skills Assessment",
                    log.technicalSkillsAssessment
                  )}
                  {renderIfNotEmpty("Coding Test Results", log.codingTestResults)}
                </div>

                {/* Candidate (Job Seeker) Details */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Candidate Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {renderIfNotEmpty("Name", log.seekerName)}
                    {renderIfNotEmpty("Email", log.seekerEmail)}
                    {renderIfNotEmpty("Phone Number", log.seekerPhoneNumber)}
                    {renderIfNotEmpty("Location", log.seekerLocation)}
                    {renderIfNotEmpty("Current Job Title", log.seekerCurrentJobTitle)}
                    {renderIfNotEmpty("Industry", log.seekerIndustry)}
                    {renderIfNotEmpty("Job Search Status", log.seekerJobSearchStatus)}
                    {renderIfNotEmpty("Years of Experience", log.seekerYearsOfExperience)}
                    {renderIfNotEmpty("About", log.seekerAbout)}
                    {renderIfNotEmpty("Experience", log.seekerExperience)}
                    {renderIfNotEmpty("Previous Job Experience", log.seekerPreviousJobExperience)}
                    {renderIfNotEmpty(
                      "Skills",
                      Array.isArray(log.seekerSkills)
                        ? log.seekerSkills.join(", ")
                        : log.seekerSkills
                    )}
                    {renderIfNotEmpty(
                      "Certifications",
                      log.seekerCertifications && JSON.stringify(log.seekerCertifications)
                    )}
                    {renderIfNotEmpty(
                      "Expected Salary",
                      log.seekerExpectedSalaryMin || log.seekerExpectedSalaryMax
                        ? `$${log.seekerExpectedSalaryMin} - $${log.seekerExpectedSalaryMax}`
                        : null
                    )}
                    {renderIfNotEmpty("Preferred Location", log.seekerPreferredLocation)}
                    {renderIfNotEmpty("Remote Preference", log.seekerRemotePreference)}
                    {renderIfNotEmpty("Desired Employment", log.seekerDesiredEmployment)}
                    {renderIfNotEmpty(
                      "Willing To Relocate",
                      log.seekerWillingToRelocate !== undefined
                        ? log.seekerWillingToRelocate
                          ? "Yes"
                          : "No"
                        : null
                    )}
                    {renderIfNotEmpty("LinkedIn", log.seekerLinkedin)}
                    {renderIfNotEmpty("GitHub", log.seekerGithub)}
                    {renderIfNotEmpty("Portfolio", log.seekerPortfolio)}
                    {renderIfNotEmpty("Education", log.seekerEducation ? JSON.stringify(log.seekerEducation) : null)}
                    {renderIfNotEmpty("Education Details", log.seekerEducationDetails ? JSON.stringify(log.seekerEducationDetails) : null)}
                    {renderIfNotEmpty("Availability Period", log.seekerAvailabilityPeriod)}
                    {renderIfNotEmpty("Available From", log.seekerAvailableFrom ? formatDate(log.seekerAvailableFrom) : null)}
                    {renderIfNotEmpty("Last Attempt At", log.seekerLastAttemptAt ? formatDate(log.seekerLastAttemptAt) : null)}
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-4 p-4">
                <Button variant="destructive" onClick={() => handleReject(log.applicationId)}>
                  Reject
                </Button>
                <Button variant="default" onClick={() => handleAccept(log.applicationId)}>
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
