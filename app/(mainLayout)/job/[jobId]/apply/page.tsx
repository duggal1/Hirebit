import { requireUser } from "@/app/utils/hooks";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
//import { JobSeekerOnboarding } from "@/components/forms/JobSeekerOnboarding";

async function getJobAndUser(jobId: string, userId: string) {
  const [job, jobSeeker] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { 
        id: jobId,
        status: "ACTIVE"
      },
      select: {
        jobTitle: true,
        company: {
          select: {
            name: true,
            logo: true
          }
        }
      }
    }),
    prisma.jobSeeker.findUnique({
      where: { userId }
    })
  ]);

  if (!job) {
    return redirect('/');
  }

  return { job, jobSeeker };
}

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await requireUser();
  
  if (!user.id) {
    return redirect('/login');
  }

  const { job, jobSeeker } = await getJobAndUser(jobId, user.id);

  // If user hasn't completed onboarding, show onboarding form
  if (!jobSeeker) {
    return <JobSeekerOnboarding jobId={jobId} job={job} />;
  }

  // If already onboarded, show application form
  return <JobApplicationForm jobSeeker={jobSeeker} jobId={jobId} job={job} />;
} 