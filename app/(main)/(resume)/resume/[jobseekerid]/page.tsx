import { JobSeekerResume } from "@/components/resume/jobseeker/resume";


interface ResumePageProps {
  params: { jobseekerid: string };
}

export default function ResumePage({ params }: ResumePageProps) {
  return <JobSeekerResume jobSeekerId={params.jobseekerid} />;
}
