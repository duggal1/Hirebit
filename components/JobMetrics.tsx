// components/JobMetrics.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getJobMetrics } from "@/src/app/actions";

type JobMetricsProps = {
  jobId: string;
};

const JobMetrics: React.FC<JobMetricsProps> = ({ jobId }) => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["jobMetrics", jobId],
    queryFn: () => getJobMetrics(jobId),
    retry: 2,
  });

  if (error) {
    return <p className="text-destructive">Failed to load metrics</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    );
  }

  return metrics ? (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Total Views</p>
        <p className="text-2xl font-semibold">{metrics.totalViews}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Total Clicks</p>
        <p className="text-2xl font-semibold">{metrics.totalClicks}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">CTR</p>
        <p className="text-2xl font-semibold">{metrics.ctr.toFixed(1)}%</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Conversion Rate</p>
        <p className="text-2xl font-semibold">
          {metrics.conversionRate.toFixed(1)}%
        </p>
      </div>
    </div>
  ) : null;
};

export default JobMetrics;
