// components/JobMetricsWrapper.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the JobMetrics component with SSR disabled.
const JobMetrics = dynamic(() => import("./JobMetrics"), { ssr: false });

interface JobMetricsWrapperProps {
  jobId: string;
}

export default function JobMetricsWrapper({ jobId }: JobMetricsWrapperProps) {
  return <JobMetrics jobId={jobId} />;
}
