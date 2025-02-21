"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";

interface JobSeekerData {
  id: string;
  name: string;
  about: string;
  skills: string[];
  experience: number; // legacy field; we show yearsOfExperience instead
  linkedin?: string;
  github?: string;
  portfolio?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  preferredLocation: string;
  remotePreference: string; // "Remote" | "Hybrid" | "On-site"
  yearsOfExperience: number;
  certifications?: {
    url: string;
    name: string;
    year: number;
    issuer: string;
  }[];
  availabilityPeriod: number; // Notice period in days
  availableFrom?: Date; // Seeker’s Availability
  education: {
    year: number;
    degree: string;
    institution: string;
    fieldOfStudy: string;
  }[];
  desiredEmployment: string; // "Full-time" | "Part-time" | "Contract"
  location: string;
  phoneNumber?: string;
  resume: string;
  // Data from JobSeekerResume table
  resumeData?: {
    resumeName: string;
    resumeBio: string;
    pdfUrlId: string;
  };
  // Data from Verification table (professional links, etc.)
  verificationData?: {
    urls: { [key: string]: string };
    updatedAt: string;
  };
}

// Updated function to generate a basic cover letter.
function generateBasicCoverLetter(jobSeeker: JobSeekerData, companyName: string): string {
  if (!jobSeeker) return "";

  const experience = jobSeeker.yearsOfExperience;
  const skills = jobSeeker.skills || [];
  const skillsText = skills.length > 0 ? `expertise in ${skills.join(", ")}` : "a diverse skill set";
  const about = jobSeeker.about || "I am passionate about leveraging my skills and experience to contribute effectively.";
  const name = jobSeeker.name || "Candidate";

  // Use the first education entry (if available) and include the graduation year.
  const education = jobSeeker.education[0] || null;
  const educationText = education
    ? `I earned my ${education.degree} in ${education.fieldOfStudy} from ${education.institution} in ${education.year}.`
    : "";

  // Build salary expectation text if available.
  let salaryText = "";
  if (jobSeeker.expectedSalaryMin && jobSeeker.expectedSalaryMax) {
    salaryText = `My salary expectation is in the range of $${jobSeeker.expectedSalaryMin} to $${jobSeeker.expectedSalaryMax}.`;
  } else if (jobSeeker.expectedSalaryMin) {
    salaryText = `My expected salary starts from $${jobSeeker.expectedSalaryMin}.`;
  } else if (jobSeeker.expectedSalaryMax) {
    salaryText = `My expected salary is up to $${jobSeeker.expectedSalaryMax}.`;
  }

  // Add remote preference details if provided.
  const remoteText = jobSeeker.remotePreference
      ? ` with a ${jobSeeker.remotePreference.toLowerCase()} work arrangement`
      : "";

  return `Dear Hiring Manager,

I am excited to apply for a position at ${companyName}. With ${experience} years of professional experience and ${skillsText}, I am confident in my ability to contribute effectively to your team.

${educationText} ${salaryText}

${about}

I am seeking ${jobSeeker.desiredEmployment} opportunities${remoteText}, and I am available to start within ${jobSeeker.availabilityPeriod} days.

Thank you for considering my application. I look forward to the possibility of contributing to ${companyName} and discussing how my background aligns with your needs.

Best regards,
${name}`;
}

export default function ApplyNowPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      toast.error("Please sign in to continue");
      router.push("/login");
    },
  });
  const companySlug: string =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
      ? params.slug[0]
      : "";

  const [jobSeeker, setJobSeeker] = useState<JobSeekerData | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useLinks, setUseLinks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for portfolio and projects
  const [portfolio, setPortfolio] = useState("");
  const [projects, setProjects] = useState<{ url: string; about: string }[]>([]);

  // Functions to manage projects array
  const addProject = () => {
    setProjects([...projects, { url: "", about: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, field: "url" | "about", value: string) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  useEffect(() => {
    console.log("Apply Page - Route params:", params);
    if (params?.verificationid) {
      const verificationId =
        typeof params.verificationid === "string"
          ? params.verificationid
          : Array.isArray(params.verificationid)
          ? params.verificationid[0]
          : "";
      fetchJobSeekerData(verificationId);
    }
  }, [params?.verificationid]);

  const fetchJobSeekerData = async (verificationId: string) => {
    try {
      console.log("Fetching job seeker data for verification ID:", verificationId);
      const response = await fetch(`/api/jobseeker/${verificationId}`);
      const data = await response.json();
      console.log("Fetched job seeker data:", data);

      if (response.ok && data && !data.error) {
        setJobSeeker(data);
        const companySlug =
          typeof params.slug === "string"
            ? params.slug
            : Array.isArray(params.slug)
            ? params.slug[0]
            : "";
        const basicCoverLetter = generateBasicCoverLetter(data, companySlug);
        setCoverLetter(basicCoverLetter);
      } else {
        console.error("Failed to fetch job seeker:", data.error);
        toast.error("Failed to load profile data. Please complete your profile first.");
      }
    } catch (error) {
      console.error("Error fetching job seeker:", error);
      toast.error("Failed to load profile data");
    }
  };

  const generateAICoverLetter = async () => {
    if (!jobSeeker?.id) {
      toast.error("Please complete your profile first");
      return;
    }

    const companySlug =
      typeof params.slug === "string"
        ? params.slug
        : Array.isArray(params.slug)
        ? params.slug[0]
        : "";
    const verificationId =
      typeof params.verificationid === "string"
        ? params.verificationid
        : Array.isArray(params.verificationid)
        ? params.verificationid[0]
        : "";

    setIsGenerating(true);
    try {
      console.log("Generating AI cover letter with params:", {
        jobSeekerId: jobSeeker.id,
        companySlug,
        verificationId,
      });

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobSeekerId: jobSeeker.id,
          companySlug,
          verificationId,
        }),
      });

      const data = await response.json();
      console.log("Generated cover letter:", data);

      if (response.ok && data.coverLetter) {
        setCoverLetter(data.coverLetter);
        toast.success("AI cover letter generated!");
      } else {
        throw new Error(data.error || "Failed to generate cover letter");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.error("Failed to generate AI cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobSeeker?.id) {
      toast.error("Job seeker profile not found");
      return;
    }

    const companySlug =
      typeof params.slug === "string"
        ? params.slug
        : Array.isArray(params.slug)
        ? params.slug[0]
        : "";
    const verificationId =
      typeof params.verificationid === "string"
        ? params.verificationid
        : Array.isArray(params.verificationid)
        ? params.verificationid[0]
        : "";

    setIsSubmitting(true);
    try {
      console.log("Submitting application with data:", {
        jobSeekerId: jobSeeker.id,
        companySlug,
        verificationId,
        includeLinks: useLinks,
        portfolio,
        projects,
        coverLetter,
      });

      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobSeekerId: jobSeeker.id,
          companySlug,
          verificationId,
          coverLetter,
          includeLinks: useLinks,
          portfolio,
          projects,
        }),
      });

      const data = await response.json();
      console.log("Submit application response:", data);

      if (data.success) {
        toast.success("Application submitted successfully!");
        router.push(`/apply/${params.id}/${companySlug}/dashboard`);
      } else {
        throw new Error(data.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submit application error:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  function LoadingSkeleton() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background relative">
        <div className="max-w-5xl mx-auto p-6 py-16 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (status === "loading" || !session) {
    return <LoadingSkeleton />;
  }

  if (!jobSeeker) {
    return <LoadingSkeleton />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))] opacity-70" />

      {/* Floating orbs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animation: "float 20s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animation: "float 25s ease-in-out infinite reverse" }}
      />

      <ScrollArea className="h-screen">
        <div className="max-w-4xl mx-auto p-8 space-y-12 relative z-10">
          <AnimatePresence>
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="space-y-6"
            >
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
                  Apply to {companySlug}
                </h1>
                <p className="text-gray-400 text-lg">
                  Shape your future with a compelling application
                </p>
              </div>

              {/* Main Application Form */}
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <motion.div variants={itemVariants} className="p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                      Cover Letter
                    </h2>
                    <Button
                      onClick={generateAICoverLetter}
                      disabled={isGenerating}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-6"
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {isGenerating ? "Crafting..." : "Generate with AI"}
                    </Button>
                  </div>

                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[400px] bg-black/30 border-white/10 focus:border-purple-500/50 rounded-xl text-gray-200"
                    placeholder="Craft your story..."
                  />

                  <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-xl border border-white/10">
                    <Checkbox
                      checked={useLinks}
                      onCheckedChange={(checked) => setUseLinks(!!checked)}
                      className="border-purple-500/50"
                    />
                    <label htmlFor="useLinks" className="cursor-pointer space-y-1">
                      <div className="font-medium">Include Professional Links</div>
                      <p className="text-sm text-gray-400">
                        Enhance your application with your digital presence
                      </p>
                    </label>
                  </div>
                </motion.div>
              </Card>

              {/* Application Preview */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Application Preview</h3>
                  <Badge className="bg-white/5 text-white border-white/10">
                    {jobSeeker?.name}
                  </Badge>
                </div>

                <Alert className="bg-white/5 border-white/10 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-purple-400" />
                  <AlertTitle className="text-white">Profile Overview</AlertTitle>
                  <AlertDescription className="mt-4 space-y-4 text-gray-300">
                    {/* General Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Years of Experience</div>
                        <div className="font-medium">{jobSeeker?.yearsOfExperience} years</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Location</div>
                        <div className="font-medium">{jobSeeker?.location}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">About</div>
                      <div className="font-medium">{jobSeeker?.about}</div>
                    </div>
                    { (jobSeeker.expectedSalaryMin || jobSeeker.expectedSalaryMax) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Expected Salary</div>
                          <div className="font-medium">
                            {jobSeeker.expectedSalaryMin && `$${jobSeeker.expectedSalaryMin}`} {jobSeeker.expectedSalaryMax && `- $${jobSeeker.expectedSalaryMax}`}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Remote Preference</div>
                          <div className="font-medium">{jobSeeker?.remotePreference}</div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Preferred Location</div>
                        <div className="font-medium">{jobSeeker?.preferredLocation}</div>
                      </div>
                      {jobSeeker?.phoneNumber && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Phone Number</div>
                          <div className="font-medium">{jobSeeker.phoneNumber}</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Education</div>
                      <div className="font-medium">
                        {jobSeeker?.education && jobSeeker.education.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {jobSeeker.education.map((edu, idx) => (
                              <li key={idx}>
                                {edu.degree} in {edu.fieldOfStudy} from {edu.institution} ({edu.year})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No education details provided."
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Certifications</div>
                      <div className="font-medium">
                        {jobSeeker?.certifications && jobSeeker.certifications.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {jobSeeker.certifications.map((cert, idx) => (
                              <li key={idx}>
                                {cert.name} from {cert.issuer} ({cert.year})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No certifications available."
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {jobSeeker?.skills?.map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>

              {/* Resume & Verification Details */}
              {jobSeeker?.resumeData && (
                <motion.div variants={itemVariants} className="space-y-6">
                  <h3 className="text-lg font-medium">Resume & Verification Details</h3>
                  <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-8 space-y-4">
                      {/* Resume Data */}
                      <div>
                        <h4 className="text-xl font-semibold">Resume Information</h4>
                        <p className="text-sm text-gray-400">Name: {jobSeeker.resumeData.resumeName}</p>
                        <p className="text-sm text-gray-400">Bio: {jobSeeker.resumeData.resumeBio}</p>
                        <p className="text-sm text-gray-400">
                          PDF URL:{" "}
                          <a
                            href={jobSeeker.resumeData.pdfUrlId}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-400"
                          >
                            View Resume
                          </a>
                        </p>
                      </div>
                      {/* Verification Data */}
                      {jobSeeker.verificationData && jobSeeker.verificationData.urls && (
                        <div>
                          <h4 className="text-xl font-semibold">Professional Links</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(jobSeeker.verificationData.urls).map(
                              ([key, url]) => (
                                <Badge
                                  key={key}
                                  className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                                >
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    {key}
                                  </a>
                                </Badge>
                              )
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            Last Updated:{" "}
                            {new Date(jobSeeker.verificationData.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Portfolio & Projects Section */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-lg font-medium">Portfolio & Projects</h3>
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-8 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="mt-1 block w-full bg-black/30 border border-white/10 rounded-xl text-gray-200 p-2"
                      />
                    </div>
                    <div className="space-y-4">
                      {projects.length === 0 && (
                        <div className="text-sm text-gray-400">
                          No projects added yet.
                        </div>
                      )}
                      {projects.map((project, index) => (
                        <div
                          key={index}
                          className="space-y-2 border border-white/10 p-4 rounded-xl"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-300">
                              Project URL
                            </label>
                            <input
                              type="url"
                              value={project.url}
                              onChange={(e) =>
                                handleProjectChange(index, "url", e.target.value)
                              }
                              placeholder="https://projectlink.com"
                              className="mt-1 block w-full bg-black/30 border border-white/10 rounded-xl text-gray-200 p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300">
                              Project Description
                            </label>
                            <Textarea
                              value={project.about}
                              onChange={(e) =>
                                handleProjectChange(index, "about", e.target.value)
                              }
                              placeholder="Describe your project..."
                              className="min-h-[100px] bg-black/30 border-white/10 focus:border-purple-500/50 rounded-xl text-gray-200"
                            />
                          </div>
                          <Button
                            onClick={() => removeProject(index)}
                            variant="destructive"
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                          >
                            Remove Project
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={addProject}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl h-12 text-lg font-medium"
                      >
                        + Add Project
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl h-14 text-lg font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, -20px);
          }
        }
      `}</style>
    </div>
  );
}