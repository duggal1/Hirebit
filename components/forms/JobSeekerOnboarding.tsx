"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "../general/FileUpload";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, MapPin, User2, Wand2, CheckCircle, AlertCircle, Loader2, Rocket, MessageSquare, Code2, FileText, UploadCloud } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createJobSeeker } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useActionState } from "react";
import { submitJobSeeker } from "@/app/actions";

// Updated ResumeAnalysis interface to match backend response
interface ResumeAnalysis {
  isValid: boolean;
  feedback: {
    strengths: string[];
    improvements: string[];
    overallFeedback: string;
  };
  skills: string[];
  experience: {
    years: number;
    level: "entry" | "mid" | "senior";
  };
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
}

// Update the form schema to remove unused fields
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  about: z.string().min(10, "Please provide at least 10 characters about yourself"),
  resume: z.string().url("Invalid resume URL").min(1, "Resume is required"),
  location: z.string().min(1, "Location is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experience: z.number().min(0, "Experience is required").default(0),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree required"),
    institution: z.string().min(1, "Institution required"),
    year: z.number().min(1900).max(new Date().getFullYear() + 5)
  })).min(1, "At least one education entry required")
});

const glowStyles = {
  backgroundImage: 'radial-gradient(circle at center, var(--primary) 0%, transparent 70%)',
  filter: 'blur(80px)',
  opacity: 0.15,
  zIndex: -1
};


// Add type for job seeker creation
interface CreateJobSeekerData {
  name: string;
  about: string;
  resume: string;
  location: string;
  skills: string[];
  experience: number;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  jobId: string;
}

interface JobSeekerOnboardingProps {
  jobId: string;
  job: {
    jobTitle: string;
    company: {
      name: string;
      logo: string;
    };
  };
}

interface FormState {
  message: string;
  success: boolean;
}

export function JobSeekerOnboarding({ jobId, job }: JobSeekerOnboardingProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);

  // Use action state for form handling
  const [state, formAction] = useActionState<FormState, FormData>(submitJobSeeker, {
    message: '',
    success: false
  });

  // Initialize form with proper validation schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      about: "",
      resume: "",
      location: "",
      skills: [],
      experience: 0,
      education: [{
        degree: "",
        institution: "",
        year: new Date().getFullYear()
      }]
    },
    mode: "onChange"
  });

  // Watch form values for validation
  const formValues = form.watch();
  const isFormValid = useMemo(() => {
    return !!(formValues.name && formValues.about && formValues.resume && formValues.location);
  }, [formValues]);

  // Handle form submission
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      // Validate form
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Please fix validation errors", {
          description: "All fields must be filled correctly"
        });
        return;
      }

      // Prepare form data
      const formData = new FormData();
      const values = form.getValues();
      
      // Add all form values
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'skills' || key === 'education') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
      formData.append('jobId', jobId);

      // Submit form using action
      formAction(formData);

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    }
  };

  // Handle successful submission
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push(`/coding-test/${jobId}`);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router, jobId]);

  const handleResumeUpload = async (url: string) => {
    try {
      setAnalyzing(true);
      
      // Validate URL format
      if (!url.startsWith('https://uploadthing.com/f/') && !url.startsWith('https://utfs.io/f/')) {
        toast.error('Invalid Resume URL', {
          description: 'Please upload a valid PDF file through our uploader'
        });
        return;
      }

      const response = await fetch('/api/validate-resume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ resumeUrl: url })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      // Set resume URL and analysis data
      form.setValue("resume", url, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      
      // Fix education year data and set state
      const fixedData = {
        ...data,
        education: data.education.map((edu: any) => ({
          ...edu,
          year: edu.year === "20xx" ? new Date().getFullYear() : Number(edu.year)
        }))
      };
      
      setResumeAnalysis(fixedData);
      
      // Auto-populate form fields with validation
      if (data.skills?.length > 0) {
        form.setValue('skills', data.skills, { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
      if (typeof data.experience?.years === 'number') {
        form.setValue('experience', data.experience.years, { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
      if (data.education?.length > 0) {
        form.setValue('education', data.education.map((edu: { year: any; }) => ({
          ...edu,
          year: Number(edu.year) || new Date().getFullYear()
        })), { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }

      toast.success('Resume Uploaded Successfully', {
        description: 'Your resume has been analyzed and form fields have been populated.'
      });

    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Upload Failed', {
        description: error instanceof Error ? error.message : 'Failed to analyze resume'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      <div className="relative mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-6">
            <motion.div 
              className="group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 opacity-30 group-hover:opacity-50 blur rounded-2xl transition" />
              <div className="relative border-primary/10 bg-card/50 backdrop-blur-xl p-4 border rounded-xl">
                {job.company.logo ? (
                  <img 
                    src={job.company.logo} 
                    alt={job.company.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="flex justify-center items-center w-16 h-16">
                    <Rocket className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                )}
              </div>
            </motion.div>
            
            <div>
              <motion.h1 
                className="bg-clip-text bg-gradient-to-r from-primary to-primary/70 font-bold text-3xl text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Complete Your Profile
              </motion.h1>
              <motion.p 
                className="mt-1 text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Applying for <span className="font-medium text-foreground">{job.jobTitle}</span> at {job.company.name}
              </motion.p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <input type="hidden" name="jobId" value={jobId} />

              {/* Personal Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 opacity-20 group-hover:opacity-30 blur rounded-2xl transition" />
                <div className="relative border-primary/10 bg-card/50 backdrop-blur-xl p-6 border rounded-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User2 className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-semibold text-xl">Personal Information</h2>
                  </div>

                  <div className="gap-6 grid md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-muted-foreground text-sm">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="John Doe"
                              className="border-primary/20 focus:border-primary bg-background/50 rounded-lg h-10 transition-all"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-muted-foreground text-sm">
                            Location
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="City, Country"
                              className="border-primary/20 focus:border-primary bg-background/50 rounded-lg h-10 transition-all"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-muted-foreground text-sm">
                            About You
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              placeholder="Tell us about yourself..."
                              className="border-primary/20 focus:border-primary bg-background/50 rounded-lg min-h-[120px] transition-all resize-none"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </motion.section>

              {/* Resume Upload */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 opacity-20 group-hover:opacity-30 blur rounded-2xl transition" />
                <div className="relative border-primary/10 bg-card/50 backdrop-blur-xl p-6 border rounded-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-semibold text-xl">Resume Upload</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="group/upload relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover/upload:opacity-30 blur rounded-xl transition" />
                            <FileUpload
                              value={field.value}
                              onChange={handleResumeUpload}
                              disabled={analyzing}
                              className="group-hover/upload:scale-[0.99] relative border-primary/20 hover:border-primary bg-background/50 border-dashed rounded-lg h-44 transition-all"
                            >
                              <div className="space-y-3 text-center">
                                <div className="bg-primary/10 mx-auto p-3 rounded-full w-fit">
                                  <UploadCloud className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">Drop your resume here</p>
                                  <p className="text-muted-foreground text-sm">PDF format • Max 4MB</p>
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
                      className="border-primary/10 bg-primary/5 mt-4 p-4 border rounded-lg"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-pulse" />
                          <Loader2 className="relative w-5 h-5 text-primary animate-spin" />
                        </div>
                        <p className="font-medium text-primary text-sm">Analyzing your resume...</p>
                      </div>
                    </motion.div>
                  )}

                  {resumeAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 mt-6"
                    >
                      {/* Experience */}
                      <div className="flex justify-between items-center bg-background/50 p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{resumeAnalysis.experience.level} Level</p>
                            <p className="text-muted-foreground text-xs">{resumeAnalysis.experience.years}+ Years Experience</p>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="bg-background/50 p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Code2 className="w-4 h-4 text-primary" />
                          <p className="font-medium text-sm">Skills</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeAnalysis.skills.map((skill, index) => (
                            <Badge 
                              key={index}
                              variant="secondary"
                              className="bg-primary/5 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Feedback Grid */}
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {/* Strengths */}
                        <div className="bg-background/50 p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <p className="font-medium text-sm">Strengths</p>
                          </div>
                          <ul className="space-y-2">
                            {resumeAnalysis.feedback.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-1.5 text-emerald-500 text-xs">•</span>
                                <span className="text-muted-foreground text-xs">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Areas to Improve */}
                        <div className="bg-background/50 p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <p className="font-medium text-sm">Areas to Improve</p>
                          </div>
                          <ul className="space-y-2">
                            {resumeAnalysis.feedback.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-1.5 text-amber-500 text-xs">•</span>
                                <span className="text-muted-foreground text-xs">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Overall Feedback */}
                      <div className="bg-background/50 p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <p className="font-medium text-sm">Overall Feedback</p>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {resumeAnalysis.feedback.overallFeedback}
                        </p>
                      </div>

                      {/* Education */}
                      <div className="bg-background/50 p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <p className="font-medium text-sm">Education</p>
                        </div>
                        <div className="space-y-3">
                          {resumeAnalysis.education.map((edu, index) => (
                            <div 
                              key={index}
                              className="flex justify-between items-center last:border-0 pb-3 last:pb-0 border-b border-border/50"
                            >
                              <div>
                                <p className="font-medium text-sm">{edu.degree}</p>
                                <p className="text-muted-foreground text-xs">{edu.institution}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {edu.year}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.section>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bottom-4 sticky border-primary/10 bg-background/80 shadow-lg backdrop-blur-xl p-4 border rounded-xl"
              >
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 opacity-50 group-hover:opacity-70 blur rounded-lg transition" />
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      "relative w-full h-12",
                      "bg-primary hover:bg-primary/90",
                      "font-medium rounded-lg",
                      !isFormValid && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!isFormValid}
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      <span>{isFormValid ? "Complete Application" : "Fill Required Fields"}</span>
                    </div>
                  </Button>
                </div>

                {state.message && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-4 text-center text-sm p-3 rounded-lg",
                      state.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
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