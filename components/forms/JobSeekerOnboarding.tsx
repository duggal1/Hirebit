"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "../general/FileUpload";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, MapPin, User2, Wand2, CheckCircle, AlertCircle, Loader2, Rocket } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createJobSeeker } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  about: z.string().min(100, "Please provide at least 100 characters about yourself"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  experience: z.number().min(0, "Experience cannot be negative"),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number()
  })).min(1, "Please add your education"),
  resume: z.string().url("Invalid resume URL"),
  location: z.string().min(2, "Please enter your location"),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
});

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

export function JobSeekerOnboarding({ jobId, job }: JobSeekerOnboardingProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      about: "",
      skills: [],
      experience: 0,
      education: [],
      resume: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
  });


const handleResumeUpload = async (url: string) => {
  try {
    setAnalyzing(true);
    form.setValue("resume", url);
    
    const response = await fetch('/api/validate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeUrl: url })
    });

    if (!response.ok) throw new Error('Analysis failed');
    
    const analysis = await response.json();
    setResumeAnalysis(analysis);

    if (!analysis.isValid) {
      toast.error('Resume Validation Failed', {
        description: analysis.feedback.overallFeedback
      });
      return;
    }

    // Auto-populate form fields
    form.setValue('skills', analysis.skills);
    form.setValue('experience', analysis.experience.years);
    form.setValue('education', analysis.education);
    
    toast.success('Resume Analysis Complete');

  } catch (error) {
    toast.error('Analysis Failed', {
      description: 'Please upload a valid resume PDF'
    });
  } finally {
    setAnalyzing(false);
  }
};

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setPending(true);
      await createJobSeeker(values);
      toast.success("Profile completed successfully!");
      router.push(`/assessment/coding-test?jobId=${jobId}`);
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gradient-to-b from-background/80 to-background/30 shadow-2xl backdrop-blur-lg border-none">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                {job.company.logo ? (
                  <img 
                    src={job.company.logo} 
                    alt={job.company.name}
                    className="rounded-lg w-14 h-14 object-contain"
                  />
                ) : (
                  <div className="flex justify-center items-center bg-primary/10 rounded-lg w-14 h-14">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="bg-clip-text bg-gradient-to-r from-primary to-purple-600 font-bold text-3xl text-transparent">
                  Complete Your Profile
                </CardTitle>
                <p className="mt-1 text-muted-foreground">
                  Applying for <span className="font-medium text-foreground">{job.jobTitle}</span> at {job.company.name}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User2 className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-semibold text-xl">Personal Information</h2>
                  </div>
                  <Separator className="bg-border/50" />
                  
                  <div className="gap-4 grid md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="rounded-xl h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="top-3.5 left-3 absolute w-5 h-5 text-muted-foreground" />
                              <Input 
                                placeholder="City, Country" 
                                {...field} 
                                className="pl-10 rounded-xl h-12"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Resume Upload Section */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="font-semibold text-xl">Resume Analysis</h2>
                    </div>
                    <Button 
                      variant="outline" 
                      asChild
                      className="gap-2 rounded-xl"
                    >
                      <Link href="/resume-builder">
                        <Wand2 className="w-4 h-4" />
                        Create Resume
                      </Link>
                    </Button>
                  </div>
                  <Separator className="bg-border/50" />
                  
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              value={field.value}
                              onChange={handleResumeUpload}
                              disabled={analyzing}
                              className="border-2 hover:border-primary/50 bg-background/50 border-dashed rounded-2xl h-48 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {analyzing && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing your resume...</span>
                      </div>
                    )}

                    {resumeAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <Tabs defaultValue="feedback" className="space-y-4">
                          <TabsList className="gap-2 bg-background/50 backdrop-blur p-1.5 rounded-xl">
                            <TabsTrigger value="feedback" className="data-[state=active]:bg-primary/10 rounded-lg">
                              Feedback
                            </TabsTrigger>
                            <TabsTrigger value="details" className="data-[state=active]:bg-primary/10 rounded-lg">
                              Extracted Details
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="feedback">
                            <div className="gap-4 grid md:grid-cols-2">
                              {/* Strengths Card */}
                              <div className="border-green-100 dark:border-green-800/60 bg-green-50 dark:bg-green-900/20 p-6 border rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                  <h3 className="font-semibold text-lg">Resume Strengths</h3>
                                </div>
                                <ul className="space-y-3">
                                  {resumeAnalysis.feedback.strengths.map((strength, index) => (
                                    <li 
                                      key={index}
                                      className="flex items-start gap-3 bg-white dark:bg-green-950/30 p-3 rounded-lg"
                                    >
                                      <div className="flex-shrink-0 bg-green-600 mt-2 rounded-full w-2 h-2" />
                                      <p className="text-sm leading-relaxed">{strength}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Improvements Card */}
                              {resumeAnalysis.feedback.improvements.length > 0 && (
                                <div className="border-amber-100 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/20 p-6 border rounded-xl">
                                  <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    <h3 className="font-semibold text-lg">Improvement Suggestions</h3>
                                  </div>
                                  <ul className="space-y-3">
                                    {resumeAnalysis.feedback.improvements.map((improvement, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-3 bg-white dark:bg-amber-950/30 p-3 rounded-lg"
                                      >
                                        <div className="flex-shrink-0 bg-amber-600 mt-2 rounded-full w-2 h-2" />
                                        <p className="text-sm leading-relaxed">{improvement}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="details">
                            <div className="gap-6 grid md:grid-cols-2">
                              <div className="space-y-4">
                                <h3 className="flex items-center gap-2 font-semibold">
                                  <GraduationCap className="w-5 h-5 text-primary" />
                                  Education
                                </h3>
                                <div className="space-y-3">
                                  {resumeAnalysis.education.map((edu, i) => (
                                    <div key={i} className="bg-muted/30 p-4 rounded-xl">
                                      <p className="font-medium text-sm">{edu.degree}</p>
                                      <p className="text-muted-foreground text-sm">{edu.institution}</p>
                                      <p className="mt-1 text-muted-foreground text-xs">
                                        Graduated: {edu.year}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="flex items-center gap-2 font-semibold">
                                  <Briefcase className="w-5 h-5 text-primary" />
                                  Experience
                                </h3>
                                <div className="bg-muted/30 p-4 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-2xl text-primary">
                                      {resumeAnalysis.experience.years}
                                    </span>
                                    <div>
                                      <p className="font-medium">Years Experience</p>
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          "mt-1 capitalize",
                                          resumeAnalysis.experience.level === 'senior' && 'bg-purple-500/10 text-purple-500',
                                          resumeAnalysis.experience.level === 'mid' && 'bg-blue-500/10 text-blue-500',
                                          resumeAnalysis.experience.level === 'entry' && 'bg-green-500/10 text-green-500',
                                        )}
                                      >
                                        {resumeAnalysis.experience.level} level
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </motion.div>
                    )}
                  </div>
                </section>

                {/* Final CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="gap-2 rounded-xl w-full h-14 font-semibold text-lg"
                    disabled={pending || !form.formState.isValid || !resumeAnalysis?.isValid}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Finalizing Your Profile...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Complete Application
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}