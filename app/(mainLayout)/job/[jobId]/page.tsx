

import { prisma } from "@/app/utils/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import React from "react";
import { benefits } from "@/app/utils/listOfBenefits";
import Image from "next/image";
import { Briefcase, Building2, Calendar, ChevronRight, ExternalLink, Globe, Heart, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/utils/auth";
import {
  GeneralSubmitButton,
  SaveJobButton,
} from "@/components/general/SubmitButtons";
import { getFlagEmoji } from "@/app/utils/countriesList";
import { JsonToHtml } from "@/components/general/JsonToHtml";
import { saveJobPost, unsaveJobPost, trackJobView } from "@/app/actions";
import { JobClickTracker } from "@/components/job/JobClickTracker";
import arcjet, { detectBot } from "@/app/utils/arcjet";
import { request } from "@arcjet/next";


const aj = arcjet.withRule(
  detectBot({
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  })
);

async function getJob(jobId: string, userId?: string) {
  const [jobData, savedJob, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({
      where: {
        id: jobId,
        status: "ACTIVE",
      },
      select: {
        jobTitle: true,
        jobDescription: true,
        location: true,
        employmentType: true,
        benefits: true,
        createdAt: true,
        listingDuration: true,
        company: {
          select: {
            name: true,
            logo: true,
            location: true,
            about: true,
            website: true,
            industry: true,
            foundedAt: true,
            employeeCount: true,
            annualRevenue: true,
            companyType: true,
            linkedInUrl: true,
            hiringStatus: true,
            glassdoorRating: true,
            techStack: true,
          },
        },
      },
    }),
    userId
      ? prisma.savedJobPost.findUnique({
          where: {
            userId_jobId: {
              userId,
              jobId,
            },
          },
          select: {
            id: true,
          },
        })
      : null,
    userId
      ? prisma.jobSeeker.findUnique({
          where: {
            userId,
          },
          select: {
            id: true,
          },
        })
      : null,
  ]);

  if (!jobData) {
    return notFound();
  }

  return {
    jobData,
    savedJob,
    jobSeekerId: jobSeeker?.id || null,
  };
}

const JobIdPage = async ({ params }: { params: { jobId: string } }) => {

  const { jobId } = await params;
  const req = await request();

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error("forbidden");
  }

  const session = await auth();
  const { jobData, savedJob, jobSeekerId } = await getJob(jobId, session?.user?.id);

  await trackJobView(jobId);
  // Track view after getting job data

  const locationFlag = getFlagEmoji(jobData.location);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Quick Action Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/10 shadow-sm">
        <div className="container max-w-7xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={
                  jobData.company.logo ??
                  `https://avatar.vercel.sh/${jobData.company.name}`
                }
                alt={jobData.company.name}
                width={40}
                height={40}
                className="rounded-xl"
              />
              <div>
                <h2 className="font-medium text-sm text-muted-foreground">
                  {jobData.company.name}
                </h2>
                <h1 className="font-semibold text-base truncate max-w-[300px] md:max-w-[500px]">
                  {jobData.jobTitle}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <form
                  action={
                    savedJob
                      ? unsaveJobPost.bind(null, savedJob.id)
                      : saveJobPost.bind(null, jobId)
                  }
                >
                  <SaveJobButton savedJob={!!savedJob} />
                </form>
              ) : null}
              <JobClickTracker jobId={jobId}>
                <Button asChild size="sm" className="rounded-full">
              <Link  href={`/resume/${jobSeekerId}`}>Quick Applyyyy</Link>
                </Button>
              </JobClickTracker>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {jobData.jobTitle}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-1.5"
                  >
                    <Briefcase className="mr-2 size-4" />
                    {jobData.employmentType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-1.5"
                  >
                    <MapPin className="mr-2 size-4" />
                    {locationFlag && <span className="mr-1">{locationFlag}</span>}
                    {jobData.location}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-1.5"
                  >
                    <Calendar className="mr-2 size-4" />
                    Posted{" "}
                    {jobData.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Badge>
                </div>
              </div>

              {/* Key Details Card */}
              <Card className="p-6 bg-primary/5 border-primary/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{jobData.company.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{jobData.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{jobData.employmentType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Apply Before</p>
                    <p className="font-medium">
                      {new Date(
                        jobData.createdAt.getTime() +
                          jobData.listingDuration * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Job Description */}
            <section className="space-y-6">
              <div className="prose prose-dark max-w-none">
                <JsonToHtml json={JSON.parse(jobData.jobDescription)} />
              </div>
            </section>

            {/* Benefits Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold">Benefits & Perks</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {benefits.map((benefit) => {
                  const isOffered = jobData.benefits.includes(benefit.id);
                  return (
                    <div
                      key={benefit.id}
                      className={`p-4 rounded-xl border ${
                        isOffered
                          ? "bg-primary/5 border-primary/10"
                          : "bg-muted/5 border-border/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{benefit.icon}</span>
                        <span className={`text-sm ${isOffered ? "font-medium" : ""}`}>
                          {benefit.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          
          <div className="space-y-4 lg:sticky lg:top-28">
      {/* Apply Card - Simplified & Modern */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md">
        <div className="p-8">
          {/* Company Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-2xl transform" />
              <Image
                src={jobData.company.logo ?? `https://avatar.vercel.sh/${jobData.company.name}`}
                alt={jobData.company.name}
                width={56}
                height={56}
                className="rounded-2xl relative ring-1 ring-white/10"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white/90">
                {jobData.company.name}
              </h3>
              <p className="text-sm text-white/60">
                {jobData.company.industry}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              asChild 
              className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl group relative overflow-hidden"
            >
                 <Link  href={`/resume/${jobSeekerId}`}>
                <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                  Quick Apply
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>

            {!session?.user && (
              <Button 
                variant="ghost" 
                asChild 
                className="w-full h-12 rounded-xl border border-white/5 hover:bg-white/5 transition-colors duration-200"
              >
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-white/70" />
                  <span className="text-white/70">Save Position</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Company Info Card - Minimalist */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white/90 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary/80" />
              Company Details
            </h3>
            
            <div className="space-y-6">
              {/* About Section */}
              <p className="text-sm text-white/60 leading-relaxed">
                {jobData.company.about}
              </p>

              {/* Key Details */}
              <div className="space-y-3">
                {jobData.company.website && (
                  <a
                    href={jobData.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2 group"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-primary/60" />
                      <span className="text-sm text-white/80 group-hover:text-primary/80 transition-colors">
                        Website
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-primary/60 transition-colors" />
                  </a>
                )}

                {Object.entries({
                  "Size": jobData.company.employeeCount && `${jobData.company.employeeCount}+ employees`,
                  "Revenue": jobData.company.annualRevenue && `$${jobData.company.annualRevenue.toLocaleString()}`,
                  "Type": jobData.company.companyType,
                  "Rating": jobData.company.glassdoorRating && `${jobData.company.glassdoorRating}/5`
                }).map(([key, value]) => value && (
                  <div key={key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-white/60">{key}</span>
                    <span className="text-sm font-medium text-white/90">{value}</span>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
             {/* Tech Stack */}
{jobData.company.techStack?.length ? (
  <div className="pt-6 border-t border-white/5 animate-fadeIn">
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="w-4 h-4 text-green-600" />
      <h4 className="text-sm font-bold text-white/90">
        Tech Stack
      </h4>
    </div>
    <div className="flex flex-wrap gap-2">
      {jobData.company.techStack.map((tech: string) => (
        <Badge
          key={tech}
          variant="secondary"
          className="
            group
            relative
            rounded-full 
            px-4 
            py-1.5 
            text-xs 
            font-bold 
            bg-gradient-to-br 
            from-indigo-800
            to-blue-600
            hover:scale-105
            hover:from-blue-400
            hover:to-indigo-600
            border-0
            transition-all
            duration-300
            ease-in-out
            backdrop-blur-sm
            shadow-[0_0_0.5px_0.25px_rgba(255,255,255,0.1)]
          "
        >
          <span className="
            relative 
            z-10 
            bg-gradient-to-r 
            from-white/90 
            to-white/70 
            bg-clip-text 
            text-transparent 
            group-hover:from-white 
            group-hover:to-white/90
            transition-all
            duration-300
          ">
            {tech}
          </span>
          <div className="
            absolute 
            inset-0 
            rounded-full 
            opacity-0 
            group-hover:opacity-100 
            group-hover:bg-primary/5 
            group-hover:blur-[6px] 
            transition-all 
            duration-300
          " />
        </Badge>
      ))}
    </div>
  </div>
) : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
          </div>
        </div>
        </div>
       
   

  );
};

export default JobIdPage;
