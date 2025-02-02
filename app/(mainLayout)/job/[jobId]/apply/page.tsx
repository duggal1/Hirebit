import { requireUser } from "@/app/utils/hooks";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
//import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";

export default async function ApplyPage({ params }: { params: { jobId: string } }) {
  const user = await requireUser();
  
  if (!user.id) {
    return redirect('/login');
  }

  // Check if job exists and is active
  const job = await prisma.jobPost.findUnique({
    where: { 
      id: params.jobId,
      status: "ACTIVE"
    },
    select: {
      id: true,
      jobTitle: true,
      company: {
        select: {
          name: true,
          logo: true
        }
      }
    }
  });

  if (!job) {
    return redirect('/');
  }

  // Check if user has already applied
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobSeekerId_jobId: {
        jobId: params.jobId,
        jobSeekerId: user.id
      }
    }
  });

  if (existingApplication) {
    return redirect(`/job/${params.jobId}?error=already_applied`);
  }

  // Get job seeker profile if exists
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    return <JobSeekerOnboarding jobId={params.jobId} job={job} />;
  }

  return <JobApplicationForm jobSeeker={jobSeeker} jobId={params.jobId} job={job} />;
} //