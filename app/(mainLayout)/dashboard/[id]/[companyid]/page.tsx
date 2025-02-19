"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

// UI components from your design system
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

// Chart components and ChartJS registration
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ----- TypeScript Interfaces -----

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

// ----- Main RecruiterDashboard Component -----

export default function RecruiterDashboard() {
  const params = useParams();
  const companyid = params.companyid as string;

  useEffect(() => {
    console.log("Dashboard params:", params);
    console.log("Company ID:", companyid);
  }, [params, companyid]);

  const [activeTab, setActiveTab] = useState<"metrics" | "jobseekers">(
    "metrics"
  );

  // --- Fetch Job Metrics ---
  const {
    data: metrics,
    isLoading: loadingMetrics,
    error: metricsError,
  } = useQuery<JobMetric[]>({
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
    refetchInterval: 5000, // live update every 5 seconds
  });

  // --- Fetch Job Seekers ---
  const {
    data: jobSeekers,
    isLoading: loadingJobSeekers,
    error: jobSeekersError,
  } = useQuery<JobSeeker[]>({
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
    refetchInterval: 5000, // live update every 5 seconds
  });

  // --- Aggregate Metrics Across All Job Posts ---
  const aggregatedMetrics = useMemo(() => {
    if (!metrics || metrics.length === 0) return null;
    const totals = metrics.reduce(
      (acc, metric) => {
        acc.totalViews += metric.totalViews;
        acc.totalClicks += metric.totalClicks;
        acc.applications += metric.applications;
        acc.ctr += metric.ctr;
        acc.conversionRate += metric.conversionRate;
        // Aggregate viewsByDate and clicksByDate across job posts
        Object.entries(metric.viewsByDate).forEach(([date, count]) => {
          acc.viewsByDate[date] = (acc.viewsByDate[date] || 0) + count;
        });
        Object.entries(metric.clicksByDate).forEach(([date, count]) => {
          acc.clicksByDate[date] = (acc.clicksByDate[date] || 0) + count;
        });
        return acc;
      },
      {
        totalViews: 0,
        totalClicks: 0,
        applications: 0,
        ctr: 0,
        conversionRate: 0,
        viewsByDate: {} as Record<string, number>,
        clicksByDate: {} as Record<string, number>,
      }
    );
    // Average CTR and conversion rate across job posts
    totals.ctr = totals.ctr / metrics.length;
    totals.conversionRate = totals.conversionRate / metrics.length;
    return totals;
  }, [metrics]);

  // --- Prepare Chart Data ---

  // Line Chart (Views Over Time)
  const lineChartData = useMemo(() => {
    if (!aggregatedMetrics) return null;
    const labels = Object.keys(aggregatedMetrics.viewsByDate).sort();
    const dataPoints = labels.map(
      (label) => aggregatedMetrics.viewsByDate[label]
    );
    return {
      labels,
      datasets: [
        {
          label: "Views Over Time",
          data: dataPoints,
          fill: false,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.4)",
          tension: 0.1,
        },
      ],
    };
  }, [aggregatedMetrics]);

  // Bar Chart (Views per Job Post)
  const barChartData = useMemo(() => {
    if (!metrics) return null;
    const labels = metrics.map((metric) => metric.jobPost.jobTitle);
    const dataPoints = metrics.map((metric) => metric.totalViews);
    return {
      labels,
      datasets: [
        {
          label: "Views per Job Post",
          data: dataPoints,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
      ],
    };
  }, [metrics]);

  // Pie Chart (Clicks vs. Remaining Views)
  const pieChartData = useMemo(() => {
    if (!aggregatedMetrics) return null;
    return {
      labels: ["Total Clicks", "Remaining Views"],
      datasets: [
        {
          data: [
            aggregatedMetrics.totalClicks,
            aggregatedMetrics.totalViews - aggregatedMetrics.totalClicks,
          ],
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };
  }, [aggregatedMetrics]);

  // --- Sorting for Job Seekers Table ---
  const [sortConfig, setSortConfig] = useState<{
    key: keyof JobSeeker;
    direction: "ascending" | "descending";
  } | null>(null);

  const sortedJobSeekers = useMemo(() => {
    if (!jobSeekers) return [];
    let sortable = [...jobSeekers];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortable;
  }, [jobSeekers, sortConfig]);

  const requestSort = (key: keyof JobSeeker) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // ----- Render Component -----
  return (
    <div className="container mx-auto p-6 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Recruiter Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>

      {(metricsError || jobSeekersError) && (
        <div className="mb-4">
          {metricsError && (
            <p className="text-red-500">
              Error loading job metrics: {metricsError.message}
            </p>
          )}
          {jobSeekersError && (
            <p className="text-red-500">
              Error loading job seekers: {jobSeekersError.message}
            </p>
          )}
        </div>
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

        {/* ----- Job Metrics Tab ----- */}
        <TabsContent value="metrics">
          {loadingMetrics ? (
            <div className="text-center p-6">Loading job metrics...</div>
          ) : (
            <ScrollArea className="h-auto max-h-[800px]">
              {/* KPI Cards */}
              {aggregatedMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="shadow-md border dark:border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">Total Views</h3>
                      <p className="text-2xl">{aggregatedMetrics.totalViews}</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md border dark:border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">Total Clicks</h3>
                      <p className="text-2xl">{aggregatedMetrics.totalClicks}</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md border dark:border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">Applications</h3>
                      <p className="text-2xl">{aggregatedMetrics.applications}</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md border dark:border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">CTR</h3>
                      <p className="text-2xl">
                        {aggregatedMetrics.ctr.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md border dark:border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">Conversion Rate</h3>
                      <p className="text-2xl">
                        {aggregatedMetrics.conversionRate.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart: Views Over Time */}
                <Card className="shadow-md border dark:border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Views Over Time
                    </h3>
                    {lineChartData ? (
                      <Line
                        data={lineChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "top" },
                            title: { display: true, text: "Views Trend" },
                          },
                        }}
                      />
                    ) : (
                      <p>No data available for line chart.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Bar Chart: Views per Job Post */}
                <Card className="shadow-md border dark:border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Views per Job Post
                    </h3>
                    {barChartData ? (
                      <Bar
                        data={barChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "top" },
                            title: { display: true, text: "Job Post Views" },
                          },
                        }}
                      />
                    ) : (
                      <p>No data available for bar chart.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Pie Chart: Clicks vs. Remaining Views */}
              <div className="mt-6">
                <Card className="shadow-md border dark:border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Clicks vs. Views
                    </h3>
                    {pieChartData ? (
                      <Pie
                        data={pieChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "top" },
                            title: {
                              display: true,
                              text: "Click Distribution",
                            },
                          },
                        }}
                      />
                    ) : (
                      <p>No data available for pie chart.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* ----- Job Seekers Tab ----- */}
        <TabsContent value="jobseekers">
          {loadingJobSeekers ? (
            <div className="text-center p-6">Loading job seekers...</div>
          ) : (
            <ScrollArea className="h-auto max-h-[800px]">
              {jobSeekers && jobSeekers.length > 0 ? (
                <Table className="min-w-full border dark:border-gray-700">
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => requestSort("name")}
                      >
                        Name
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => requestSort("email")}
                      >
                        Email
                      </TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => requestSort("yearsOfExperience")}
                      >
                        Experience (Years)
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>About</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => requestSort("createdAt")}
                      >
                        Created At
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedJobSeekers.map((seeker) => (
                      <TableRow
                        key={seeker.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150"
                      >
                        <TableCell>{seeker.name}</TableCell>
                        <TableCell>{seeker.email}</TableCell>
                        <TableCell>{seeker.phoneNumber || "N/A"}</TableCell>
                        <TableCell>{seeker.yearsOfExperience}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {seeker.jobSearchStatus}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={seeker.about}
                        >
                          {seeker.about}
                        </TableCell>
                        <TableCell>
                          {typeof seeker.education === "object"
                            ? JSON.stringify(seeker.education)
                            : seeker.education}
                        </TableCell>
                        <TableCell>{seeker.skills.join(", ")}</TableCell>
                        <TableCell>
                          <a
                            href={seeker.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            View Resume
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(seeker.createdAt).toLocaleString()}
                        </TableCell>
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
