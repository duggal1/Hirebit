import { requireUser } from "@/app/utils/hooks";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";

export default async function ApplyPage({ params }: { params: { jobId: string } }) {
  const user = await requireUser();
  if (!user.id) return redirect('/login');

  const { jobId } = params;

  const job = await prisma.jobPost.findUnique({
    where: { 
      id: jobId,
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

  if (!job) return redirect('/');

  // Check for existing application
  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });

  const existingApplication = jobSeeker && await prisma.jobApplication.findUnique({
    where: {
      jobSeekerId_jobId: {
        jobId,
        jobSeekerId: jobSeeker.id
      }
    }
  });

  // If there's an existing application, redirect to coding test
  if (existingApplication) {
    return redirect(`/coding-test/${jobId}`);
  }

  // If no job seeker profile, show onboarding
  if (!jobSeeker) {
    return <JobSeekerOnboarding jobId={jobId} job={job} />;
  }

  // Otherwise, redirect to coding test
  return redirect(`/coding-test/${jobId}`);
}