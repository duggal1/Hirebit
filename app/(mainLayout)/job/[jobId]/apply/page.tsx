import { requireUser } from "@/app/utils/hooks";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
//import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";

export default async function ApplyPage({ params }: { params: { jobId: string } }) {
  // First await the user check
  const user = await requireUser();
  if (!user.id) return redirect('/login');

  // Then destructure jobId from params
  const { jobId } = params;

  // Now use the jobId variable for all subsequent operations
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

  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobSeekerId_jobId: {
        jobId,
        jobSeekerId: user.id
      }
    }
  });

  if (existingApplication) {
    return redirect(`/job/${jobId}?error=already_applied`);
  }

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: user.id }
  });

  if (!jobSeeker) {
    return <JobSeekerOnboarding jobId={jobId} job={job} />;
  }

  return <JobApplicationForm jobSeeker={jobSeeker} jobId={jobId} job={job} />;
} //