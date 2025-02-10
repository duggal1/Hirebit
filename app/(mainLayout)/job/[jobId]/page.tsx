// app/(mainLayout)/job/[jobId]/page.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import React from "react";
import { benefits } from "@/app/utils/listOfBenefits";
import Image from "next/image";
import { Heart } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/utils/auth";
import { SaveJobButton } from "@/components/general/SubmitButtons";
import { getFlagEmoji } from "@/app/utils/countriesList";
import { JsonToHtml } from "@/components/general/JsonToHtml";
import { saveJobPost, unsaveJobPost } from "@/app/actions";
import arcjet, { detectBot } from "@/app/utils/arcjet";
import { request } from "@arcjet/next";
import { prisma } from "@/app/utils/db";
import { JobClickTracker, JobViewTracker } from "@/components/metrics/JobMetricsTracker";
import JobMetricsWrapper from "@/components/JobMetricsWrapper";

// Protect requests with arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  })
);

// Fetch the job data from the database.
async function getJob(jobId: string, userId?: string) {
  const [jobData, savedJob] = await Promise.all([
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
  ]);

  if (!jobData) {
    return notFound();
  }

  return { jobData, savedJob };
}

type PageProps = {
  params: { jobId: string };
};

const JobIdPage = async ({ params }: PageProps) => {
  const { jobId } = params;
  const req = await request();
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error("forbidden");
  }

  const session = await auth();
  const { jobData, savedJob } = await getJob(jobId, session?.user?.id);
  const locationFlag = getFlagEmoji(jobData.location);

  return (
    <div className="mx-auto py-8 container">
      <JobViewTracker jobId={jobId} />
      <div className="gap-8 grid lg:grid-cols-[1fr,400px]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-bold text-3xl">{jobData.jobTitle}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium">{jobData.company.name}</span>
                <Badge className="rounded-full" variant="secondary">
                  {jobData.employmentType}
                </Badge>
                <span className="md:inline hidden text-muted-foreground">•</span>
                <Badge className="rounded-full">
                  {locationFlag && <span className="mr-1">{locationFlag}</span>}
                  {jobData.location} Only
                </Badge>
              </div>
            </div>
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
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">
                  <Heart className="mr-2" size={16} />
                  Save Job
                </Link>
              </Button>
            )}
          </div>

          <section>
            <JsonToHtml json={jobData.jobDescription} />
          </section>

          <section>
            <h3 className="mb-4 font-semibold">
              Benefits{" "}
              <span className="font-normal text-muted-foreground text-sm">
                (green is offered and red is not offered)
              </span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {benefits.map((benefit) => {
                const isOffered = jobData.benefits.includes(benefit.id);
                return (
                  <Badge
                    key={benefit.id}
                    variant={isOffered ? "default" : "outline"}
                    className={`text-sm px-4 py-1.5 rounded-full ${
                      !isOffered && "opacity-75 cursor-not-allowed"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {benefit.icon}
                      {benefit.label}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </section>

          {/* Metrics Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Job Performance Metrics</h3>
              {/* Use the client-side wrapper */}
              <JobMetricsWrapper jobId={jobId} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Now Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Apply now</h3>
                </div>
                <p className="mt-1 text-muted-foreground text-sm">
                  Please let {jobData.company.name} know you found this job on
                  JobMarshal. This helps us grow!
                </p>
              </div>
              {session?.user ? (
                <form action={`/job/${jobId}/apply`}>
                  <JobClickTracker jobId={jobId} location={jobData.location}>
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                  </JobClickTracker>
                </form>
              ) : (
                <Button asChild className="w-full" size="lg">
                  <Link href="/login">Sign in to Apply</Link>
                </Button>
              )}
            </div>
          </Card>

          {/* Job Details Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">About the job</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Apply before
                  </span>
                  <span className="text-sm">
                    {new Date(
                      jobData.createdAt.getTime() +
                        jobData.listingDuration * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Posted on
                  </span>
                  <span className="text-sm">
                    {jobData.createdAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Employment type
                  </span>
                  <span className="text-sm">{jobData.employmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Location
                  </span>
                  <Badge variant="secondary">{jobData.location}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Company Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    jobData.company.logo ??
                    `https://avatar.vercel.sh/${jobData.company.name}`
                  }
                  alt={jobData.company.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{jobData.company.name}</h3>
                  <p className="line-clamp-3 text-muted-foreground text-sm">
                    {jobData.company.about}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobIdPage;
