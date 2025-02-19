"use client";

import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

// Shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Icons from lucide-react (add any missing ones if needed)
import { Mail, Phone, MapPin, Calendar, Briefcase, FileText, Link, MessageSquare, Award, Eye, Star, Package, Activity, Clock, Book } from "lucide-react";

// ----------------------------------------------
// Type Definitions
// ----------------------------------------------
interface JobApplication {
  id: string;
  status: string;
  coverLetter: string;
  resume: string;
  includeLinks: boolean;
  answers: any;
  aiScore: number;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  portfolio?: string;
  projects?: any;
  job: {
    id: string;
    title: string;
    employmentType: string;
    location: string;
    salary: { from: number; to: number };
    applicationData: any;
    requirements: {
      skills: string[];
      experience: string;
      position: string;
    };
    metrics: any;
    codingQuestions: any;
  };
  recruiterData: {
    notes: string;
    feedback: string;
    stage: string;
    lastReviewed: string;
    reviewedBy: string;
  };
  assessment: {
    cultureFitScore: number;
    communicationScore: number;
    technical: any;
    codingResults: any;
  };
}

interface TransformedJobSeeker {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location: string;
  bio: string;
  about: string;
  jobApplications: JobApplication[];
  resumes: {
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
  }[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastAttempt: string;
  };
}

// ----------------------------------------------
// Helper Functions to Format JSON Fields
// ----------------------------------------------
const formatAnswers = (answers: any): string => {
  if (!answers) return "";
  if (answers.set) {
    if (Array.isArray(answers.set)) {
      return answers.set
        .map(
          (item: any, index: number) =>
            `Item ${index + 1}:\n  URL: ${item.url}\n  About: ${item.about}`
        )
        .join("\n\n");
    } else if (typeof answers.set === "object") {
      return Object.entries(answers.set)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }
  }
  return JSON.stringify(answers, null, 2);
};

const formatProjects = (projects: any): string => {
  if (!projects) return "";
  if (projects.set && Array.isArray(projects.set)) {
    return projects.set
      .map(
        (proj: any, index: number) =>
          `Project ${index + 1}:\n  URL: ${proj.url}\n  About: ${proj.about}`
      )
      .join("\n\n");
  }
  return JSON.stringify(projects, null, 2);
};

// ----------------------------------------------
// Fetch Function
// ----------------------------------------------
const fetchLogsData = async (companyid: string): Promise<TransformedJobSeeker[]> => {
  const res = await fetch(`/api/dashboard/${companyid}/logs`);
  if (!res.ok) {
    throw new Error("Error fetching logs data");
  }
  return res.json();
};

// ----------------------------------------------
// Additional UI Components
// ----------------------------------------------
const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
      accepted: "bg-green-500/20 text-green-500 border-green-500/50",
      rejected: "bg-red-500/20 text-red-500 border-red-500/50",
      reviewing: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-500/20 text-gray-500 border-gray-500/50";
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(status)} backdrop-blur-sm`}>
      {status}
    </span>
  );
};

const MetricCard = ({ icon: Icon, label, value, subValue }: { icon: React.ElementType; label: string; value: string | number; subValue?: string; }) => (
  <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className="bg-gray-800/50 p-3 rounded-full">
          <Icon size={24} className="text-gray-400" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AssessmentScore = ({ label, score }: { label: string; score: number; }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium">{score}%</span>
    </div>
    <Progress value={score} className="h-2 bg-gray-800" indicatorClassName="bg-blue-500" />
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string; }) => (
  <div className="flex items-center space-x-2 text-gray-300">
    <Icon size={18} className="text-gray-400" />
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

// ----------------------------------------------
// Logs Page Component
// ----------------------------------------------
export default function LogsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const recruiterId = params.id as string;
  const companyid = params.companyid as string;
  const jobSeekerId = searchParams.get("jobSeekerId");

  if (!jobSeekerId) {
    return (
      <div className="p-6 text-red-500">
        No job seeker selected. Please go back and select a job seeker.
      </div>
    );
  }

  const { data: logsData, isLoading, error } = useQuery<TransformedJobSeeker[]>({
    queryKey: ["logsData", companyid],
    queryFn: () => fetchLogsData(companyid),
  });

  if (isLoading) {
    return <div className="p-6">Loading application logs...</div>;
  }
  if (error || !logsData) {
    return (
      <div className="p-6 text-red-500">
        Error loading logs. Please try again later.
      </div>
    );
  }

  const selectedSeeker = logsData.find((seeker) => seeker.id === jobSeekerId);
  if (!selectedSeeker) {
    return (
      <div className="p-6 text-red-500">
        No applications found for this job seeker.
      </div>
    );
  }

  const { name, email, phoneNumber, location, bio, about, resumes, jobApplications, metadata } = selectedSeeker;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100">
      {/* Gradient Header with Blur Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-teal-900/30 backdrop-blur-3xl" />
        <div className="relative px-8 py-12">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            ← Back to Dashboard
          </Button>
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400">
              {name}
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">{bio}</p>
          </div>
        </div>
      </div>

      <main className="px-8 py-6 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            icon={Briefcase} 
            label="Total Applications" 
            value={jobApplications.length}
            subValue="Across all positions"
          />
          <MetricCard 
            icon={FileText} 
            label="Active Resumes" 
            value={resumes.filter(r => r.isActive).length}
            subValue={`of ${resumes.length} total`}
          />
          <MetricCard 
            icon={FileText} 
            label="Average AI Score" 
            value={`${(jobApplications.reduce((acc, app) => acc + app.aiScore, 0) / jobApplications.length).toFixed(1)}`}
            subValue="Based on all applications"
          />
          <MetricCard 
            icon={Calendar} 
            label="Last Activity" 
            value={new Date(metadata.lastAttempt).toLocaleDateString()}
            subValue="Most recent update"
          />
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Mail className="mr-2" size={24} />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="Email" value={email} />
                <InfoItem icon={Phone} label="Phone" value={phoneNumber || "N/A"} />
                <InfoItem icon={MapPin} label="Location" value={location} />
                <InfoItem icon={Calendar} label="Member Since" value={new Date(metadata.createdAt).toLocaleDateString()} />
              </div>

              <div className="bg-gray-800/40 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-300 leading-relaxed">{about}</p>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Scores */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Award className="mr-2" size={24} />
                Assessment Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {jobApplications.map(app => app.assessment).filter(Boolean).map((assessment, index) => (
                <div key={index} className="space-y-4">
                  <AssessmentScore label="Culture Fit" score={assessment.cultureFitScore} />
                  <AssessmentScore label="Communication" score={assessment.communicationScore} />
                  {assessment.technical && (
                    <AssessmentScore label="Technical" score={assessment.technical.score || 0} />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resumes Section */}
        {resumes && resumes.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Book className="mr-2" size={24} />
                Resume Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold flex items-center">
                            {resume.name}
                            {resume.isActive && (
                              <Badge className="ml-2 bg-green-500/20 text-green-400">Active</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-400">Version {resume.version}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-500/20 text-blue-400"
                          onClick={() => window.open(resume.pdfUrl, '_blank')}
                        >
                          <FileText size={18} className="mr-2" />
                          View PDF
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-300">{resume.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {resume.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-gray-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(resume.timestamps.updated).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications Section */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Briefcase className="mr-2" size={24} />
              Job Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] rounded-md border border-gray-800">
              <div className="space-y-6 p-6">
                {jobApplications.map((app) => (
                  <Card key={app.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all">
                    <CardContent className="p-6">
                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold mb-2">
                            <span className="font-semibold">Job Title:</span> {app.job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Briefcase size={16} className="mr-2" />
                              <span className="font-semibold">Employment Type:</span> {app.job.employmentType}
                            </span>
                            <span className="flex items-center">
                              <MapPin size={16} className="mr-2" />
                              <span className="font-semibold">Location:</span> {app.job.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={16} className="mr-2" />
                              <span className="font-semibold">Applied On:</span> {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ApplicationStatusBadge status={app.status} />
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="bg-gray-900/50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold mb-2 flex items-center">
                              <MessageSquare size={18} className="mr-2" />
                              <span className="font-semibold">Cover Letter:</span>
                            </h4>
                            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                              {app.coverLetter}
                            </p>
                          </div>
                          {app.portfolio && (
                            <div className="bg-gray-900/50 rounded-lg p-4">
                              <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <Link size={18} className="mr-2" />
                                <span className="font-semibold">Portfolio:</span>
                              </h4>
                              <a
                                href={app.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-3 rounded-lg transition-all"
                              >
                                <Link size={16} className="mr-2" />
                                View Complete Portfolio
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {app.projects && (
                            <div className="bg-gray-900/50 rounded-lg p-4">
                              <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <FileText size={18} className="mr-2" />
                                <span className="font-semibold">Projects:</span>
                              </h4>
                              <p className="text-gray-300 whitespace-pre-line">
                                {formatProjects(app.projects)}
                              </p>
                            </div>
                          )}
                          {app.answers && (
                            <div className="bg-gray-900/50 rounded-lg p-4">
                              <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <MessageSquare size={18} className="mr-2" />
                                <span className="font-semibold">Application Answers:</span>
                              </h4>
                              <p className="text-gray-300 whitespace-pre-line">
                                {formatAnswers(app.answers)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recruiter Feedback Section */}
                      {app.recruiterData && (
                        <div className="bg-gray-900/50 rounded-lg p-4 mt-6">
                          <h4 className="text-lg font-semibold mb-2 flex items-center">
                            <MessageSquare size={18} className="mr-2" />
                            <span className="font-semibold">Recruiter Feedback:</span>
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Stage</p>
                              <p className="text-gray-300">{app.recruiterData.stage}</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Feedback</p>
                              <p className="text-gray-300">{app.recruiterData.feedback}</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Notes</p>
                              <p className="text-gray-300">{app.recruiterData.notes}</p>
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                              Last reviewed: {new Date(app.recruiterData.lastReviewed).toLocaleDateString()} by {app.recruiterData.reviewedBy}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-6 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/50"
                        >
                          Accept Application
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/50"
                        >
                          Reject Application
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
