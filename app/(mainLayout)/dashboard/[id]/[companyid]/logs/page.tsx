"use client";

import React, { JSX } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

// Shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Icons from lucide-react
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Link,
  MessageSquare,
  Award,
  Book,
  ChevronLeft,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

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
  userId: string;
  email: string;
  currentJobTitle: string | null;
  industry: string;
  jobSearchStatus: string;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  preferredLocation: string;
  remotePreference: string;
  yearsOfExperience: number;
  certifications: string | null;
  availabilityPeriod: number;
  availableFrom: string | null;
  education: any;
  educationDetails: string | null;
  desiredEmployment: string;
  name: string;
  about: string;
  skills: string[];
  experience: number;
  previousJobExperience: any;
  location: string;
  phoneNumber?: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resumes: {
    id: string;
    name: string;
    bio: string;
    pdfUrl: string;
    version: number;
    isActive: boolean;
    keywords: string[];
    parsedData: any;
    timestamps: {
      updated: string;
    };
  }[];
  willingToRelocate: boolean | null;
  lastAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
  jobApplications: JobApplication[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastAttempt: string | null;
  };
}

// ----------------------------------------------
// Helper Components for Structured Answers and Projects
// ----------------------------------------------
const AnswersDisplay = ({ answers }: { answers: any }) => {
  if (!answers || !answers.set) return null;

  if (Array.isArray(answers.set)) {
    return (
      <ul className="list-disc pl-5">
        {answers.set.map((item: any, index: number) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-2"
          >
            <strong>Item {index + 1}</strong>
            <div>
              URL:{" "}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {item.url}
                </a>
              ) : (
                "N/A"
              )}
            </div>
            <div>
              About:{" "}
              {item.about
                ? typeof item.about === "object"
                  ? JSON.stringify(item.about, null, 2)
                  : item.about
                : "No description provided."}
            </div>
          </motion.li>
        ))}
      </ul>
    );
  }

  if (typeof answers.set === "object") {
    return (
      <ul className="list-disc pl-5">
        {Object.entries(answers.set).map(([key, value], index) => (
          <motion.li
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-2"
          >
            <strong>{key}:</strong>{" "}
            {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
          </motion.li>
        ))}
      </ul>
    );
  }

  return <pre>{JSON.stringify(answers, null, 2)}</pre>;
};

const ProjectsDisplay = ({ projects }: { projects: any }) => {
  if (!projects || !projects.set) return null;

  if (Array.isArray(projects.set)) {
    return (
      <ul className="list-disc pl-5">
        {projects.set.map((proj: any, index: number) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-2"
          >
            <strong>Project {index + 1}</strong>
            <div>
              URL:{" "}
              {proj.url ? (
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {proj.url}
                </a>
              ) : (
                "N/A"
              )}
            </div>
            <div>
              About:{" "}
              {proj.about
                ? typeof proj.about === "object"
                  ? JSON.stringify(proj.about, null, 2)
                  : proj.about
                : "No details provided."}
            </div>
          </motion.li>
        ))}
      </ul>
    );
  }

  return <pre>{JSON.stringify(projects, null, 2)}</pre>;
};

const renderAnswerValue = (value: any): JSX.Element => {
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {value}
        </a>
      );
    }
    return <span>{value}</span>;
  } else if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5">
        {value.map((item, idx) => (
          <li key={idx}>{renderAnswerValue(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <div className="pl-5 space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <strong className="capitalize">{k}:</strong> {renderAnswerValue(v)}
          </div>
        ))}
      </div>
    );
  } else {
    return <span>{String(value)}</span>;
  }
};

const ApplicationAnswersDisplay = ({ answers }: { answers: any }) => {
  if (!answers) return null;
  return (
    <div className="space-y-4">
      {Object.entries(answers).map(([key, value], index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <strong className="capitalize">{key}:</strong> {renderAnswerValue(value)}
        </motion.div>
      ))}
    </div>
  );
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
// Enhanced UI Components
// ----------------------------------------------
const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { color: string; icon: React.ElementType } } = {
      pending: {
        color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
        icon: Clock,
      },
      accepted: {
        color: "bg-green-500/20 text-green-500 border-green-500/50",
        icon: CheckCircle2,
      },
      rejected: {
        color: "bg-red-500/20 text-red-500 border-red-500/50",
        icon: XCircle,
      },
      reviewing: {
        color: "bg-blue-500/20 text-blue-500 border-blue-500/50",
        icon: Star,
      },
    };
    return (
      configs[status.toLowerCase()] || {
        color: "bg-gray-500/20 text-gray-500 border-gray-500/50",
        icon: Clock,
      }
    );
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border ${config.color} backdrop-blur-sm flex items-center gap-2`}
    >
      <Icon size={14} />
      {status}
    </motion.span>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
}) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="group"
  >
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl hover:border-gray-600/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-400 mb-1"
            >
              {label}
            </motion.p>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            >
              {value}
            </motion.p>
            {subValue && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-gray-500 mt-2 font-medium"
              >
                {subValue}
              </motion.p>
            )}
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-xl relative">
              <Icon size={24} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AssessmentScore = ({ label, score }: { label: string; score: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-2"
  >
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium">{score}%</span>
    </div>
    <div className="relative">
      <Progress value={score} className="h-2 bg-gray-800" />
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50"
        initial={{ width: "0%" }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center space-x-2 text-gray-300 bg-gray-800/30 p-3 rounded-lg backdrop-blur-sm"
  >
    <div className="p-2 bg-gray-700/30 rounded-lg">
      <Icon size={18} className="text-gray-400" />
    </div>
    <span className="font-medium text-gray-400">{label}:</span>
    <span className="text-gray-200">{value}</span>
  </motion.div>
);

// ----------------------------------------------
// Main Logs Page Component
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
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 bg-red-500/10 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20"
        >
          No job seeker selected. Please go back and select a job seeker.
        </motion.div>
      </div>
    );
  }

  const { data: logsData, isLoading, error } = useQuery<TransformedJobSeeker[]>({
    queryKey: ["logsData", companyid],
    queryFn: () => fetchLogsData(companyid),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030014]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl animate-pulse" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
          >
            Loading application logs...
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !logsData) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 bg-red-500/10 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20"
        >
          Error loading logs. Please try again later.
        </motion.div>
      </div>
    );
  }

  const selectedSeeker = logsData.find((seeker) => seeker.id === jobSeekerId);
  if (!selectedSeeker) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 bg-red-500/10 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20"
        >
          No applications found for this job seeker.
        </motion.div>
      </div>
    );
  }

  const {
    id,
    userId,
    email,
    currentJobTitle,
    industry,
    jobSearchStatus,
    expectedSalaryMin,
    expectedSalaryMax,
    preferredLocation,
    remotePreference,
    yearsOfExperience,
    certifications,
    availabilityPeriod,
    availableFrom,
    education,
    educationDetails,
    desiredEmployment,
    name,
    about,
    resumes,
    skills,
    experience,
    previousJobExperience,
    location,
    phoneNumber,
    linkedin,
    github,
    portfolio,
    willingToRelocate,
    lastAttemptAt,
    createdAt,
    updatedAt,
    jobApplications,
    metadata,
  } = selectedSeeker;

  return (
    <div className="min-h-screen bg-black text-gray-100 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#030014]" />
        <div className="absolute inset-0 bg-black" />
        <div className="" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.05) 0%, rgba(30, 58, 138, 0.05) 25%, rgba(15, 23, 42, 0) 50%)',
          }}
        />
      </div>

      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-900/20 border-b border-gray-700/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Back to Dashboard
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
          <div className="relative p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-7xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                  {name}
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
                {about}
              </p>
              <div className="flex gap-4">
                <Badge className="px-4 py-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                  {jobApplications.length} Applications
                </Badge>
                <Badge className="px-4 py-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {resumes.filter((r: { isActive: any; }) => r.isActive).length} Active Resumes
                </Badge>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20 hover:border-purple-500/40 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <Briefcase className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {jobApplications.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Additional stat cards can be added similarly */}
        </div>

        {/* Grid Layout for Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-black shadow-2xl backdrop-blur-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-10 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-30 blur-3xl"></div>
                <CardTitle className="text-3xl font-extrabold flex items-center gap-4 text-white">
                  <div className="p-4 rounded-2xl bg-black border border-blue-500/30 shadow-lg">
                    <Mail className="w-7 h-7 text-blue-400" />
                  </div>
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10 space-y-10">
                {/* Existing Info Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={Mail} label="Email" value={email} />
                  <InfoItem icon={Phone} label="Phone" value={phoneNumber || "N/A"} />
                  <InfoItem icon={MapPin} label="Location" value={location || "N/A"} />
                  <InfoItem
                    icon={Calendar}
                    label="Member Since"
                    value={new Date(metadata.createdAt).toLocaleDateString()}
                  />
                </div>
                {/* New Info Items added under Profile Information */}
              
                {/* About Section */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-10 rounded-3xl backdrop-blur-lg border border-gray-700/50 shadow-xl">
                  <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    About
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {about}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

       
        </div>

        {resumes && resumes.length > 0 && (
               <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10 blur-3xl" />
      <Card className="bg-black/40 backdrop-blur-2xl border-zinc-800/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5" />
        <CardHeader className="p-10 relative">
          <CardTitle className="text-3xl font-bold flex items-center gap-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-xl">
              <Book className="w-8 h-8 text-purple-400" />
            </div>
            Resume Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-black/50 to-zinc-900/50 border-zinc-800/30 hover:border-purple-500/30 transition-all duration-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <CardContent className="p-8 relative">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-3">
                        <h4 className="text-2xl font-semibold flex items-center gap-3 text-white">
                          {resume.name}
                          {resume.isActive && (
                            <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30">
                              Active
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-zinc-400">
                          Version {resume.version}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 hover:from-purple-500/20 hover:to-cyan-500/20 text-white border border-purple-500/30 hover:border-cyan-500/30 backdrop-blur-xl transition-all duration-500"
                        onClick={() => window.open(resume.pdfUrl, "_blank")}
                      >
                        <FileText size={18} className="mr-2" />
                        View PDF
                      </Button>
                    </div>
                    <div className="space-y-6">
                      <p className="text-zinc-300 leading-relaxed">{resume.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.keywords.map((keyword, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-gradient-to-r from-zinc-900/50 to-black/50 text-zinc-300 border-zinc-700/30 hover:border-purple-500/30 transition-all duration-500"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-zinc-500">
                        Last updated: {new Date(resume.timestamps.updated).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>

        )}

        {/* Applications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="relative bg-black/40 border-gray-800/30 backdrop-blur-xl overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-blue-900/5 to-cyan-900/5" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                  animation: 'shine 8s linear infinite'
                }}
              />
            </div>

            {/* Header */}
            <CardHeader className="p-8 relative">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Applications
                </span>
              </CardTitle>
            </CardHeader>

            {/* Scrollable Content */}
            <CardContent className="relative px-0">
              <ScrollArea className="h-[800px]">
                <div className="space-y-6 p-8">
                  {jobApplications.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <Card className="relative bg-gray-950/50 border-gray-800/30 backdrop-blur-xl overflow-hidden hover:border-gray-700/30 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-blue-900/5 to-cyan-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <CardContent className="p-8 relative">
                          {/* Application Header */}
                          <div className="flex justify-between items-start mb-8">
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                {app.job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                                {[
                                  { icon: Briefcase, text: app.job.employmentType },
                                  { icon: MapPin, text: app.job.location },
                                  { icon: Calendar, text: new Date(app.createdAt).toLocaleDateString() }
                                ].map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800/30">
                                      <item.icon size={14} className="text-gray-400" />
                                    </div>
                                    {item.text}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Content Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-6"
                            >
                              {/* Cover Letter */}
                              <div className="bg-gradient-to-br from-gray-900/30 to-black/30 rounded-2xl p-8 border border-gray-800/30 backdrop-blur-sm group-hover:border-gray-700/30 transition-all duration-500">
                                <h4 className="text-lg font-medium mb-4 flex items-center gap-3">
                                  <MessageSquare size={18} className="text-blue-400" />
                                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Cover Letter
                                  </span>
                                </h4>
                                <p className="text-gray-400 leading-relaxed">
                                  {app.coverLetter}
                                </p>
                              </div>

                              {/* Portfolio Link */}
                              {app.portfolio && (
                                <div className="bg-gradient-to-br from-gray-900/30 to-black/30 rounded-2xl p-6 border border-gray-800/30 backdrop-blur-sm group-hover:border-gray-700/30 transition-all duration-500">
                                  <a
                                    href={app.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Link size={18} />
                                    View Portfolio
                                    <ArrowRight size={18} className="ml-auto" />
                                  </a>
                                </div>
                              )}
                            </motion.div>

                            {/* Right Column */}
                            <div className="space-y-6">
                              {app.projects && (
                                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700/30 backdrop-blur-sm">
                                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                    <FileText size={20} className="text-purple-400" />
                                    Projects
                                  </h4>
                                  <ProjectsDisplay projects={app.projects} />
                                </div>
                              )}
                              {app.answers && (
                                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700/30 backdrop-blur-sm">
                                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                    <MessageSquare size={20} className="text-purple-400" />
                                    Application Answers
                                  </h4>
                                  <ApplicationAnswersDisplay answers={app.answers} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4 pt-4">
                            <Button
                              variant="outline"
                              className="flex-1 bg-green-500/5 hover:bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/30 backdrop-blur-sm transition-all duration-300"
                            >
                              <CheckCircle2 size={18} className="mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/30 backdrop-blur-sm transition-all duration-300"
                            >
                              <XCircle size={18} className="mr-2" />
                              Reject
                            </Button>
                          </div>

                          {/* Recruiter Feedback */}
                          {app.recruiterData && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-8 bg-gradient-to-br from-gray-900/30 to-black/30 rounded-2xl p-8 border border-gray-800/30 backdrop-blur-sm"
                            >
                              <h4 className="text-lg font-medium mb-6 flex items-center gap-3">
                                <MessageSquare size={18} className="text-purple-400" />
                                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                  Recruiter Feedback
                                </span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-black/20 p-6 rounded-xl border border-gray-800/30">
                                  <p className="text-sm text-gray-400 mb-2">Stage</p>
                                  <p className="text-lg text-gray-200">{app.recruiterData.stage}</p>
                                </div>
                                <div className="bg-black/20 p-6 rounded-xl border border-gray-800/30">
                                  <p className="text-sm text-gray-400 mb-2">Feedback</p>
                                  <p className="text-lg text-gray-200">{app.recruiterData.feedback}</p>
                                </div>
                                <div className="md:col-span-2 bg-black/20 p-6 rounded-xl border border-gray-800/30">
                                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                                  <p className="text-lg text-gray-200">{app.recruiterData.notes}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <style jsx global>{`
            @keyframes shine {
              from { transform: translateX(-100%); }
              to { transform: translateX(100%); }
            }
          `}</style>
        </motion.div>
      </main>
    </div>
  )
}
