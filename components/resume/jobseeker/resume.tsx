"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/general/FileUpload";
import {
  Rocket,
  UploadCloud,
  Loader2,
  Briefcase,
  CheckCircle,
  GraduationCap,
  XCircle,
  Zap,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { submitJobSeekerResume } from "@/src/app/actions";
import { v4 as uuidv4 } from "uuid";
import { useActionState } from "@/src/lib/useaction";
import { Progress } from "@/src/app/_components/ui/progress";

// Define a dedicated Zod schema for resume details.
const resumeFormSchema = z.object({
  resumeId: z.string().uuid().optional(),
  resumeName: z.string().min(2, "Resume name must be at least 2 characters"),
  resumeBio: z.string().min(10, "Resume bio must be at least 10 characters"),
  pdfUrlId: z
    .string()
    .url("Invalid PDF URL")
    .min(1, "Resume PDF is required"),
});

interface FormState {
  message: string;
  success: boolean;
}

interface JobSeekerResumeProps {
  jobSeekerId: string;
}

export function JobSeekerResume({ jobSeekerId }: JobSeekerResumeProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  // State to store the complete analysis data from the API.
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);

  // Generate a unique resume ID on component mount.
  const [generatedResumeId] = useState(() => uuidv4());

  // Prepare the action state for submitting the resume.
  const [state, formAction] = useActionState<FormState, FormData>(
    submitJobSeekerResume,
    {
      message: "",
      success: false,
    }
  );

  // Initialize the form using our dedicated resume schema.
  const form = useForm<z.infer<typeof resumeFormSchema>>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      resumeId: generatedResumeId,
      resumeName: "",
      resumeBio: "",
      pdfUrlId: "",
    },
    mode: "onChange",
  });

  // Watch form values and calculate overall validity.
  const formValues = form.watch();
  const isFormValid = useMemo(() => {
    return !!(formValues.resumeName && formValues.resumeBio && formValues.pdfUrlId);
  }, [formValues]);

  // Handle form submission.
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Please fix validation errors", {
          description: "All fields must be filled correctly",
        });
        return;
      }
      const formData = new FormData();
      const values = form.getValues();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
      });
      // Append the jobSeekerId from the Prisma model.
      formData.append("jobSeekerId", jobSeekerId);
      formAction(formData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit form"
      );
    }
  };


  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      // Redirect to app/coding-test/[jobSeekerId]/page.tsx
      router.push(`/coding-test/${jobSeekerId}`);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router, jobSeekerId]);

  
  // Handle resume file upload using UploadThing.
  const handleResumeUpload = async (url: string) => {
    try {
      setAnalyzing(true);
      // Validate the URL returned from UploadThing.
      if (
        !url.startsWith("https://uploadthing.com/f/") &&
        !url.startsWith("https://utfs.io/f/")
      ) {
        toast.error("Invalid Resume URL", {
          description: "Please upload a valid PDF file through our uploader",
        });
        return;
      }
      const response = await fetch("/api/validate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ resumeUrl: url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }
      // Set the PDF URL in the form.
      form.setValue("pdfUrlId", url, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      // Save the full analysis data from the API.
      setResumeAnalysis(data);
      toast.success("Resume Uploaded and Analyzed Successfully", {
        description: "Your resume has been uploaded and analyzed.",
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error("Upload Failed", {
        description:
          error instanceof Error ? error.message : "Failed to upload resume",
      });
    } finally {
      setAnalyzing(false);
    }
  };
  const pathname = usePathname();
const isCodingTestPage = pathname.includes("/coding-test/");

return (
  <div className="relative min-h-screen bg-black overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 pointer-events-none">
      <div className=""></div>
      <div className=""></div>
    </div>

    <div className="relative mx-auto px-6 py-12 max-w-7xl z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-10"
      >
        {/* Ultra modern header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative mb-16"
        >
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-700/20 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-blue-800/30 to-purple-800/30 p-6 rounded-xl backdrop-blur-lg border border-gray-700"
            >
              <Rocket className="w-10 h-10 text-blue-300" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Resume Analysis
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-3 text-xl text-gray-300"
              >
                Let's enhance your professional profile
              </motion.p>
            </div>
          </div>
        </motion.header>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Glass card container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Personal Info Card */}
              <div className="bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg">
                <FormField
                  control={form.control}
                  name="resumeName"
                  render={({ field }) => (
                    <FormItem className="mb-8">
                      <FormLabel className="text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Resume Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-14 bg-black border border-gray-700 focus:border-blue-400 rounded-xl text-white placeholder-gray-500"
                          placeholder="Enter a name for your resume"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumeBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Professional Bio
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[150px] bg-black border border-gray-700 focus:border-blue-400 rounded-xl text-white placeholder-gray-500"
                          placeholder="Write a compelling professional bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
    
              {/* Main container with clean layout */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-1 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-transparent to-cyan-600/20 animate-gradient-slow"></div>
                
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-xl p-8 border border-gray-700">
                  {/* Clean, organized content layout */}
                  <div className="space-y-8">
                    {/* Modern header section */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-800/10 border border-violet-800/20">
                        <span className="text-xs font-medium text-violet-300">Dont have a Resume?</span>
                      </div>
                      
                      <h2 className="text-3xl font-semibold tracking-tight text-white">
                        dont worrry we got you!!
                      </h2>
                      
                      <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                        Design a professional resume that captures attention and showcases your potential.
                      </p>
                    </div>

                    {/* Feature highlights with clean spacing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-black/30 border border-gray-700">
                        <div className="text-sm font-medium text-white">AI-Powered</div>
                        <div className="text-xs text-gray-400 mt-1">Smart formatting & suggestions</div>
                      </div>
                      <div className="p-4 rounded-xl bg-black/30 border border-gray-700">
                        <div className="text-sm font-medium text-white">ATS-Friendly</div>
                        <div className="text-xs text-gray-400 mt-1">Optimized for job systems</div>
                      </div>
                    </div>

                    {/* Modern call-to-action button */}
                    <a
                      href={`/resume/${jobSeekerId}/resume-builder`}
                      className="group relative flex items-center justify-between w-full"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-black/40 border border-gray-700 group-hover:border-gray-500 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <Rocket className="w-5 h-5 text-violet-400" />
                          <span className="font-medium text-white">Start Building</span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </a>
                  </div>

                  {/* Clean status indicator */}
                  <div className="absolute bottom-8 right-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs text-gray-500 font-medium">System Online</span>
                  </div>
                </div>
              </div>

              {/* Upload Card */}
              <div className="bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-gradient-to-r from-blue-800/20 to-purple-800/20 p-3 rounded-lg"
                  >
                    <UploadCloud className="w-6 h-6 text-blue-300" />
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Upload Resume
                  </h2>
                </div>
                  
                <FormField
                  control={form.control}
                  name="pdfUrlId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <FileUpload
                            value={field.value}
                            onChange={handleResumeUpload}
                            disabled={analyzing}
                            className="border-2 border-dashed border-gray-700 hover:border-blue-400 rounded-2xl transition-all duration-300"
                          >
                            <div className="flex flex-col items-center justify-center h-56 space-y-6">
                              <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="bg-gradient-to-r from-blue-800/20 to-purple-800/20 p-5 rounded-full"
                              >
                                <UploadCloud className="w-10 h-10 text-blue-300" />
                              </motion.div>
                              <div className="text-center">
                                <p className="text-xl font-medium text-white mb-2">
                                  Drop your resume here
                                </p>
                                <p className="text-gray-400">PDF format • Max 4MB</p>
                              </div>
                            </div>
                          </FileUpload>
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {analyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="bg-blue-700/10 rounded-xl p-4 border border-blue-700/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
                        <p className="text-blue-300 font-medium">
                          Analyzing your resume...
                        </p>
                      </div>
                      <Progress
                        value={66}
                        className="h-1 bg-gray-700"
                        indicatorClassName="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Analysis Results */}
            <AnimatePresence>
              {resumeAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Stats Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="col-span-full bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Resume Statistics
                      </h3>
                      {resumeAnalysis.isValid ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span>Valid Resume</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle className="w-5 h-5" />
                          <span>Needs Improvement</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Experience Level */}
                      <div className="bg-black/30 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <Briefcase className="w-5 h-5 text-blue-300" />
                          <span className="text-gray-400">Experience</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {resumeAnalysis.experience.years} Years
                        </p>
                        <p className="text-gray-400 mt-1">
                          {resumeAnalysis.experience.level}
                        </p>
                      </div>

                      {/* Skills Overview */}
                      <div className="bg-black/30 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <Zap className="w-5 h-5 text-purple-300" />
                          <span className="text-gray-400">Skills</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {resumeAnalysis.skills.length}
                        </p>
                        <p className="text-gray-400 mt-1">Key Skills</p>
                      </div>

                      {/* Education */}
                      <div className="bg-black/30 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <GraduationCap className="w-5 h-5 text-yellow-400" />
                          <span className="text-gray-400">Education</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {resumeAnalysis.education.length}
                        </p>
                        <p className="text-gray-400 mt-1">Qualifications</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Skills Cloud */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg"
                  >
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                      Skills Overview
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeAnalysis.skills.map((skill: string, index: number) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-800/10 to-purple-800/10 rounded-full text-blue-300 text-sm font-medium"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Education Timeline */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg"
                  >
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                      Education
                    </h3>
                    <div className="space-y-4">
                      {resumeAnalysis.education.map(
                        (
                          edu: { degree: string; institution: string; year: string },
                          index: number
                        ) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="relative pl-6 pb-4 border-l border-gray-700"
                          >
                            <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400" />
                            <p className="text-white font-medium">{edu.degree}</p>
                            <p className="text-gray-400">{edu.institution}</p>
                            <p className="text-gray-500 text-sm">{edu.year}</p>
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>

                  {/* Feedback Analysis */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg"
                  >
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                      Detailed Feedback
                    </h3>
                    <div className="space-y-6">
                      {/* Strengths */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-800/10 rounded-xl p-4 border border-green-800/20"
                      >
                        <h4 className="text-green-400 font-medium mb-2">
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {resumeAnalysis.feedback.strengths.map(
                            (strength: string, index: number) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-2 text-gray-300"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{strength}</span>
                              </motion.li>
                            )
                          )}
                        </ul>
                      </motion.div>

                      {/* Areas for Improvement */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-800/10 rounded-xl p-4 border border-yellow-800/20"
                      >
                        <h4 className="text-yellow-400 font-medium mb-2">
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {resumeAnalysis.feedback.improvements.map(
                            (improvement: string, index: number) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-2 text-gray-300"
                              >
                                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                <span>{improvement}</span>
                              </motion.li>
                            )
                          )}
                        </ul>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Buzzwords Analysis */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg"
                  >
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                      Buzzword Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Buzzwords</span>
                        <span className="text-2xl font-bold text-white">
                          {resumeAnalysis.buzzwords.count}
                        </span>
                      </div>
                      {resumeAnalysis.buzzwords.list.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {resumeAnalysis.buzzwords.list.map(
                            (word: string, index: number) => (
                              <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-3 py-1 bg-purple-800/10 text-purple-300 rounded-full text-sm"
                              >
                                {word}
                              </motion.span>
                            )
                          )}
                        </div>
                      )}
                      {resumeAnalysis.buzzwords.warning && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-red-800/10 rounded-xl border border-red-800/20"
                        >
                          <p className="text-red-400 text-sm font-medium">
                            ⚠️ High buzzword usage detected. Consider reducing for more impact.
                          </p>
                        </motion.div>
                      )}

                      {/* Critical Flaws Card */}
                      {resumeAnalysis.criticalFlaws && resumeAnalysis.criticalFlaws.length > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255,0,0,0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="relative bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg overflow-hidden"
                        >
                          {/* Animated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-400/10 to-red-300/10 pointer-events-none blur-3xl"></div>
                          <div className="relative">
                            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent mb-4">
                              Critical Flaws
                            </h3>
                            <ul className="space-y-2">
                              {resumeAnalysis.criticalFlaws.map((flaw: string, index: number) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-2 text-red-400 text-lg"
                                >
                                  <XCircle className="w-5 h-5" />
                                  <span>{flaw}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}

                      {/* Additional Recommendations Card */}
                      {resumeAnalysis.additionalRecommendations && (
                        <motion.div
                          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="relative bg-black/30 backdrop-blur-lg rounded-3xl border border-gray-700 p-8 shadow-lg overflow-hidden"
                        >
                          {/* Animated gradient background overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-800/10 via-purple-800/10 to-pink-800/10 pointer-events-none blur-3xl"></div>
                          <div className="relative">
                            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                              Additional Recommendations
                            </h3>
                            <p className="text-lg text-gray-300 leading-relaxed">
                              {resumeAnalysis.additionalRecommendations}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
  type="submit"
  disabled={!isFormValid}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className={cn(
    "w-full h-14 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg font-semibold transition transform duration-200 ease-in-out",
    !isFormValid && "opacity-50 cursor-not-allowed"
  )}
>
  <div className="flex items-center justify-center gap-2">
    <Rocket className="w-5 h-5" />
    <span>{isFormValid ? "Submit Resume" : "Complete All Fields"}</span>
  </div>
</motion.button>


          </form>
        </Form>
      </motion.div>
    </div>
  </div>
)
}
