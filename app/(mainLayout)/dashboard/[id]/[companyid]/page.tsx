"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobMetric {
  id: string;
  totalViews: number;
  totalClicks: number;
  applications: number;
  ctr: number;
  conversionRate: number;
  viewsByDate: Record<string, number>;
  clicksByDate: Record<string, number>;
  locationData: Record<string, any>;
  topCandidateMatch?: Record<string, any>;
  candidateMatchScores?: Record<string, any>;
  skillsMatchData?: Record<string, any>;
  experienceMatchData?: Record<string, any>;
  locationMatchData?: Record<string, any>;
  salaryMatchData?: Record<string, any>;
  applicationQuality?: Record<string, any>;
  applicationScores?: Record<string, any>;
  applicationFeedback?: Record<string, any>;
  skillGaps?: Record<string, any>;
  competitorBenchmark?: Record<string, any>;
  marketSalaryData?: Record<string, any>;
  marketSkillsData?: Record<string, any>;
  industryTrends?: Record<string, any>;
  timeToFillEstimate?: number;
  dropOffAnalysis?: Record<string, any>;
  applicationTimeline?: Record<string, any>;
  hiringVelocity?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  jobPost: {
    id: string;
    jobTitle: string;
    employmentType: string;
    location: string;
    salaryFrom: number;
    salaryTo: number;
    jobDescription: string;
    status: string;
    applications: number;
    views: number;
    clicks: number;
    company: {
      id: string;
      name: string;
      industry: string;
    };
  };
}

interface JobSeeker {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  yearsOfExperience: number;
  education: any;
  resume: string;
  skills: string[];
  about: string;
  createdAt: string;
  updatedAt: string;
  jobSearchStatus?: string;
}

export default function RecruiterDashboard() {
  const params = useParams();
  const companyid = params.companyid as string;

  // Log the params received
  useEffect(() => {
    console.log("Dashboard params:", params);
    console.log("Company ID:", companyid);
  }, [params, companyid]);

  const [activeTab, setActiveTab] = useState<"metrics" | "jobseekers">("metrics");

  // Fetch job metrics
  const { data: metrics, isLoading: loadingMetrics, error: metricsError } = useQuery<JobMetric[]>({
    queryKey: ["jobMetrics", companyid],
    queryFn: async () => {
      console.log("Fetching job metrics for company:", companyid);
      const response = await fetch(`/api/dashboard/${companyid}/metrics`);
      if (!response.ok) {
        console.error("Error fetching metrics:", response.statusText);
        throw new Error("Error fetching metrics");
      }
      const data = await response.json();
      console.log("Fetched job metrics:", data);
      return data;
    },
    refetchInterval: 5000, // Live updates every 5 seconds
  });

  // Fetch job seekers
  const { data: jobSeekers, isLoading: loadingJobSeekers, error: jobSeekersError } = useQuery<JobSeeker[]>({
    queryKey: ["jobSeekers", companyid],
    queryFn: async () => {
      console.log("Fetching job seekers for company:", companyid);
      const response = await fetch(`/api/dashboard/${companyid}/jobseekers`);
      if (!response.ok) {
        console.error("Error fetching job seekers:", response.statusText);
        throw new Error("Error fetching job seekers");
      }
      const data = await response.json();
      console.log("Fetched job seekers:", data);
      return data;
    },
    refetchInterval: 5000, // Live updates every 5 seconds
  });

  return (
    <div className="container mx-auto p-6 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>

      {metricsError && (
        <p className="text-red-500">Error loading job metrics: {metricsError.message}</p>
      )}
      {jobSeekersError && (
        <p className="text-red-500">Error loading job seekers: {jobSeekersError.message}</p>
      )}

      <Tabs
        defaultValue="metrics"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "metrics" | "jobseekers")}
      >
        <TabsList className="mb-4 border-b dark:border-gray-700">
          <TabsTrigger value="metrics" className="px-4 py-2">
            Job Metrics
          </TabsTrigger>
          <TabsTrigger value="jobseekers" className="px-4 py-2">
            Job Seekers
          </TabsTrigger>
        </TabsList>

        {/* Job Metrics Tab */}
        <TabsContent value="metrics">
          {loadingMetrics ? (
            <div className="text-center p-6">Loading job metrics...</div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 gap-4">
                {metrics && metrics.length > 0 ? (
                  metrics.map((metric) => (
                    <Card key={metric.id} className="border dark:border-gray-700 shadow-md">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-2">{metric.jobPost.jobTitle}</h2>
                        <p className="mb-1">
                          <span className="font-medium">Employment Type:</span>{" "}
                          {metric.jobPost.employmentType}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Location:</span>{" "}
                          {metric.jobPost.location}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p>
                              <span className="font-medium">Views:</span> {metric.totalViews}
                            </p>
                            <p>
                              <span className="font-medium">Clicks:</span> {metric.totalClicks}
                            </p>
                            <p>
                              <span className="font-medium">Applications:</span>{" "}
                              {metric.applications}
                            </p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">CTR:</span> {metric.ctr}%
                            </p>
                            <p>
                              <span className="font-medium">Conversion:</span>{" "}
                              {metric.conversionRate}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Updated: {new Date(metric.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-6">No job metrics available.</div>
                )}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Job Seekers Tab */}
        <TabsContent value="jobseekers">
          {loadingJobSeekers ? (
            <div className="text-center p-6">Loading job seekers...</div>
          ) : (
            <ScrollArea className="h-[600px]">
              {jobSeekers && jobSeekers.length > 0 ? (
                <Table className="min-w-full border dark:border-gray-700">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Experience (Years)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>About</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobSeekers.map((seeker) => (
                      <TableRow key={seeker.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell>{seeker.name}</TableCell>
                        <TableCell>{seeker.email}</TableCell>
                        <TableCell>{seeker.phoneNumber || "N/A"}</TableCell>
                        <TableCell>{seeker.yearsOfExperience}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{seeker.jobSearchStatus}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{seeker.about}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-6">No job seekers found.</div>
              )}
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
