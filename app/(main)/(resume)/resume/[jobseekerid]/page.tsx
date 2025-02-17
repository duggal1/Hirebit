import { JobSeekerResume } from "@/components/resume/jobseeker/resume";

interface ResumePageProps {
  params: Promise<{ jobseekerid: string }>;
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { jobseekerid } = await params;
  return <JobSeekerResume jobSeekerId={jobseekerid} />;
}
