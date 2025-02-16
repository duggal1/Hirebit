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
import { Rocket, UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { submitJobSeekerResume } from "@/app/actions";
import { v4 as uuidv4 } from "uuid";
import { useActionState } from "@/lib/useaction";

// Define a dedicated Zod schema for resume details.
const resumeFormSchema = z.object({
  resumeId: z.string().uuid().optional(),
  resumeName: z.string().min(2, "Resume name must be at least 2 characters"),
  resumeBio: z.string().min(10, "Resume bio must be at least 10 characters"),
  pdfUrlId: z.string().url("Invalid PDF URL").min(1, "Resume PDF is required"),
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
  const [state, formAction] = useActionState<FormState, FormData>(submitJobSeekerResume, {
    message: "",
    success: false,
  });

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
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    }
  };

  // Redirect to coding test upon successful submission.
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
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
      if (!url.startsWith("https://uploadthing.com/f/") && !url.startsWith("https://utfs.io/f/")) {
        toast.error("Invalid Resume URL", {
          description: "Please upload a valid PDF file through our uploader",
        });
        return;
      }
      const response = await fetch("/api/validate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
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
        description: error instanceof Error ? error.message : "Failed to upload resume",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-black to-gray-900 min-h-screen">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-noise opacity-10" />
      <div className="relative mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-6">
            <div className="bg-gray-900 p-4 rounded-xl shadow-xl">
              <Rocket className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <div>
              <motion.h1
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Resume Details
              </motion.h1>
              <motion.p
                className="mt-1 text-gray-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Complete your resume details below.
              </motion.p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <input type="hidden" name="jobSeekerId" value={jobSeekerId} />
              <input type="hidden" name="resumeId" value={generatedResumeId} />

              {/* Resume Details Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 p-6 rounded-xl shadow-xl"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="resumeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Resume Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your resume name"
                            className="bg-gray-800 text-white placeholder-gray-500 border-gray-700 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resumeBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Resume Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Write a short bio for your resume"
                            className="bg-gray-800 text-white placeholder-gray-500 border-gray-700 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.section>

              {/* Resume Upload Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 p-6 rounded-xl shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-900 p-2 rounded-lg">
                    <Rocket className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Upload Your Resume</h2>
                </div>
                <FormField
                  control={form.control}
                  name="pdfUrlId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <FileUpload
                            value={field.value}
                            onChange={handleResumeUpload}
                            disabled={analyzing}
                            className="relative border-dashed border-gray-700 hover:border-blue-500 bg-gray-800 rounded-lg h-44 transition-all"
                          >
                            <div className="flex flex-col items-center justify-center h-full space-y-3">
                              <div className="bg-blue-900 p-3 rounded-full">
                                <UploadCloud className="w-8 h-8 text-blue-400" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-white">Drop your resume here</p>
                                <p className="text-gray-400 text-sm">PDF format • Max 4MB</p>
                              </div>
                            </div>
                          </FileUpload>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                {analyzing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                      <p className="text-blue-400 font-medium text-sm">
                        Uploading and Analyzing your resume...
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.section>

              {/* Resume Analysis Output Section */}
              {resumeAnalysis && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900 p-6 rounded-xl shadow-xl mt-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Resume Analysis</h2>
                  <div className="space-y-4">
                    <div>
                      <span className="text-lg font-semibold text-white">Validity: </span>
                      <span className={resumeAnalysis.isValid ? "text-green-400" : "text-red-400"}>
                        {resumeAnalysis.isValid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Feedback:</h3>
                      <p className="text-white">
                        Overall: {resumeAnalysis.feedback.overallFeedback}
                      </p>
                      <p className="text-white">
                        Strengths: {resumeAnalysis.feedback.strengths.join(", ")}
                      </p>
                      <p className="text-white">
                        Improvements: {resumeAnalysis.feedback.improvements.join(", ")}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Skills:</h3>
                      <p className="text-white">{resumeAnalysis.skills.join(", ")}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Experience:</h3>
                      <p className="text-white">
                        Years: {resumeAnalysis.experience.years}, Level:{" "}
                        {resumeAnalysis.experience.level}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Education:</h3>
                      <ul className="list-disc ml-6 text-white">
                        {resumeAnalysis.education.map(
                          (
                            edu: { degree: string; institution: string; year: number | string },
                            idx: number
                          ) => (
                            <li key={idx}>
                              {edu.degree} from {edu.institution} ({edu.year})
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    {/* New Section: Buzzwords Analysis */}
                    <div>
                      <h3 className="text-xl font-semibold text-white">Buzzwords Analysis:</h3>
                      <p className="text-white">
                        Buzzwords Count: {resumeAnalysis.buzzwords.count}
                      </p>
                      {resumeAnalysis.buzzwords.list.length > 0 ? (
                        <p className="text-white">
                          Buzzwords: {resumeAnalysis.buzzwords.list.join(", ")}
                        </p>
                      ) : (
                        <p className="text-white">No buzzwords detected.</p>
                      )}
                      {resumeAnalysis.buzzwords.warning && (
                        <p className="text-red-400 font-semibold">
                          Warning: Excessive buzzwords may turn off recruiters!
                        </p>
                      )}
                    </div>
                    {/* New Section: Critical Flaws */}
                    <div>
                      <h3 className="text-xl font-semibold text-white">Critical Flaws:</h3>
                      {resumeAnalysis.criticalFlaws.length > 0 ? (
                        <ul className="list-disc ml-6 text-white">
                          {resumeAnalysis.criticalFlaws.map((flaw: string, idx: number) => (
                            <li key={idx}>{flaw}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-white">No critical flaws detected.</p>
                      )}
                    </div>
                    {/* New Section: Additional Recommendations */}
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Additional Recommendations:
                      </h3>
                      <p className="text-white">
                        {resumeAnalysis.additionalRecommendations || "No additional recommendations."}
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky bottom-4 bg-gray-900 p-4 rounded-xl shadow-xl"
              >
                <div className="relative">
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      "w-full h-12 bg-blue-600 hover:bg-blue-700 font-medium text-white rounded-lg",
                      !isFormValid && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!isFormValid}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Rocket className="w-4 h-4 text-white" />
                      <span>{isFormValid ? "Submit Resume" : "Fill Required Fields"}</span>
                    </div>
                  </Button>
                </div>
                {state.message && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-4 text-center text-sm p-3 rounded-lg",
                      state.success ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                    )}
                  >
                    {state.message}
                  </motion.p>
                )}
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
