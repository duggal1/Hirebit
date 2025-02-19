"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

// Shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

/* -------------------------------------------------------------------------- */
/*                              Type Declarations                             */
/* -------------------------------------------------------------------------- */

interface DashboardMetric {
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  metrics: {
    views: number;
    clicks: number;
    applications: number;
    ctr: number;
    conversionRate: number;
    viewsTrend: Record<string, number>;
    clicksTrend: Record<string, number>;
    locationData: Record<string, any>;
    applicationDetails: any[];
  };
  createdAt: string;
}

interface JobSeeker {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location: string;
  currentJobTitle?: string;
  industry?: string;
  bio: string;
  yearsOfExperience: number;
  about: string;
  createdAt: string;
  updatedAt: string;
  education?: any;
  skills?: string[];
  jobSearchStatus?: string;
  experience: number;
  previousJobExperience: string;
  certifications?: any[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  preferredLocation?: string;
  remotePreference?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  JobSeekerResume: any[];
  applications: any[];
}

/* Chart data interfaces */
interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

/* -------------------------------------------------------------------------- */
/*                        Recruiter Dashboard Component                       */
/* -------------------------------------------------------------------------- */

export default function RecruiterDashboard() {
  const params = useParams();
  const companyid = params.companyid as string;
  const recruiterId = params.id as string;
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard params:", params);
    console.log("Company ID:", companyid);
    console.log("Recruiter ID:", recruiterId);
  }, [params, companyid, recruiterId]);

  // --- Fetch Metrics from API ---
  const { data: metrics, isLoading: loadingMetrics, error: metricsError } = useQuery<DashboardMetric[]>({
    queryKey: ["jobMetrics", companyid],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${companyid}/metrics`);
      if (!res.ok) throw new Error("Error fetching metrics");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // --- Fetch Job Seekers from API ---
  const { data: jobSeekers, isLoading: loadingJobSeekers, error: jobSeekersError } = useQuery<JobSeeker[]>({
    queryKey: ["jobSeekers", companyid],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${companyid}/jobseekers`);
      if (!res.ok) throw new Error("Error fetching job seekers");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // --- Aggregate Metrics (e.g., total views, clicks, applications) ---
  const aggregatedMetrics = useMemo(() => {
    if (!metrics || metrics.length === 0) return null;
    const totals = metrics.reduce(
      (acc, metric) => {
        acc.totalViews += metric.metrics.views;
        acc.totalClicks += metric.metrics.clicks;
        acc.totalApplications += metric.metrics.applications;
        acc.ctr += metric.metrics.ctr;
        acc.conversionRate += metric.metrics.conversionRate;
        Object.entries(metric.metrics.viewsTrend).forEach(([date, count]) => {
          acc.viewsByDate[date] = (acc.viewsByDate[date] || 0) + count;
        });
        Object.entries(metric.metrics.clicksTrend).forEach(([date, count]) => {
          acc.clicksByDate[date] = (acc.clicksByDate[date] || 0) + count;
        });
        return acc;
      },
      {
        totalViews: 0,
        totalClicks: 0,
        totalApplications: 0,
        ctr: 0,
        conversionRate: 0,
        viewsByDate: {} as Record<string, number>,
        clicksByDate: {} as Record<string, number>,
      }
    );
    totals.ctr = totals.ctr / metrics.length;
    totals.conversionRate = totals.conversionRate / metrics.length;
    return totals;
  }, [metrics]);

  // --- Prepare Chart Data ---
  const lineChartData: LineChartData | null = useMemo(() => {
    if (!aggregatedMetrics) return null;
    const labels = Object.keys(aggregatedMetrics.viewsByDate).sort();
    const dataPoints = labels.map((label) => aggregatedMetrics.viewsByDate[label]);
    return {
      labels,
      datasets: [
        {
          label: "Views Over Time",
          data: dataPoints,
          fill: false,
          borderColor: "#4fd1c5",
          backgroundColor: "#4fd1c5",
          tension: 0.1,
        },
      ],
    };
  }, [aggregatedMetrics]);

  const barChartData: BarChartData | null = useMemo(() => {
    if (!metrics) return null;
    const labels = metrics.map((m) => m.jobTitle);
    const dataPoints = metrics.map((m) => m.metrics.views);
    return {
      labels,
      datasets: [
        {
          label: "Views per Job Post",
          data: dataPoints,
          backgroundColor: "#9f7aea",
        },
      ],
    };
  }, [metrics]);

  const pieChartData: PieChartData | null = useMemo(() => {
    if (!aggregatedMetrics) return null;
    return {
      labels: ["Total Clicks", "Remaining Views"],
      datasets: [
        {
          data: [
            aggregatedMetrics.totalClicks,
            aggregatedMetrics.totalViews - aggregatedMetrics.totalClicks,
          ],
          backgroundColor: ["#63b3ed", "#f56565"],
        },
      ],
    };
  }, [aggregatedMetrics]);

  // --- Quick View Modal State for Job Seeker Details ---
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<JobSeeker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openQuickView = (seeker: JobSeeker) => {
    setSelectedJobSeeker(seeker);
    setIsModalOpen(true);
  };

  const closeQuickView = () => {
    setSelectedJobSeeker(null);
    setIsModalOpen(false);
  };

  // --- Sorting for Job Seekers Table ---
  const [sortConfig, setSortConfig] = useState<{ key: keyof JobSeeker; direction: "ascending" | "descending" } | null>(null);

  const sortedJobSeekers = useMemo(() => {
    if (!jobSeekers) return [];
    const sortable = [...jobSeekers];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </header>

      {/* --- Dashboard Metrics Section --- */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-6">Dashboard Metrics</h2>
        {loadingMetrics ? (
          <div className="text-center py-10">Loading metrics...</div>
        ) : aggregatedMetrics ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{aggregatedMetrics.totalViews}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{aggregatedMetrics.totalClicks}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{aggregatedMetrics.totalApplications}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{aggregatedMetrics.ctr.toFixed(2)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{aggregatedMetrics.conversionRate.toFixed(2)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Job Seekers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{jobSeekers ? jobSeekers.length : 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle>Views Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
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
                    <p className="text-center">No data available.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle>Views per Job Post</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
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
                    <p className="text-center">No data available.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 shadow-xl col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Clicks vs. Views</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {pieChartData ? (
                    <Pie
                      data={pieChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: true, text: "Click Distribution" },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center">No data available.</p>
                  )}
                </CardContent>
              </Card>
              {/* Map / Additional Tools Placeholder */}
              <Card className="bg-gray-800 border-gray-700 shadow-xl col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Geographical Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-center text-gray-400">
                    [Map Placeholder - integrate your mapping tool here]
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <p className="text-center py-10">No metrics data available.</p>
        )}
      </section>

      {/* --- Job Seekers Section --- */}
      <section>
        <h2 className="text-3xl font-semibold mb-6">Job Seekers</h2>
        {loadingJobSeekers ? (
          <div className="text-center py-10">Loading job seekers...</div>
        ) : jobSeekers && jobSeekers.length > 0 ? (
          <ScrollArea className="rounded-md border border-gray-700">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                    Name
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
                    Email
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("location")}>
                    Location
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("yearsOfExperience")}>
                    Experience (Years)
                  </TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Quick View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobSeekers.map((seeker) => (
                  <TableRow
                    key={seeker.id}
                    className="hover:bg-gray-700 transition-colors duration-150"
                  >
                    <TableCell>{seeker.name}</TableCell>
                    <TableCell>{seeker.email}</TableCell>
                    <TableCell>{seeker.location}</TableCell>
                    <TableCell>{seeker.yearsOfExperience != null ? seeker.yearsOfExperience : "N/A"}</TableCell>
                    <TableCell>{seeker.applications?.length || 0}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openQuickView(seeker)}>
                        Quick View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <p className="text-center py-10">No job seekers found.</p>
        )}
      </section>

      {/* --- Quick View Modal for Job Seeker Details --- */}
      {selectedJobSeeker && (
        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeQuickView(); }}>
          <DialogContent className="bg-gray-900 border border-gray-700 shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedJobSeeker.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-sm">
              <p><strong>Email:</strong> {selectedJobSeeker.email}</p>
              <p><strong>Phone:</strong> {selectedJobSeeker.phoneNumber || "N/A"}</p>
              <p><strong>Location:</strong> {selectedJobSeeker.location}</p>
              <p><strong>Current Job Title:</strong> {selectedJobSeeker.currentJobTitle || "N/A"}</p>
              <p><strong>Industry:</strong> {selectedJobSeeker.industry || "N/A"}</p>
              <p>
                <strong>Job Search Status:</strong> {selectedJobSeeker.jobSearchStatus || "N/A"}
              </p>
              <p>
                <strong>Years of Experience:</strong> {selectedJobSeeker.yearsOfExperience != null ? selectedJobSeeker.yearsOfExperience : "N/A"}
              </p>
              <p><strong>Bio:</strong> {selectedJobSeeker.bio?.trim() || "N/A"}</p>
              <p>
                <strong>About:</strong> {selectedJobSeeker.about?.trim() || "N/A"}
              </p>
              <p>
                <strong>Previous Job Experience:</strong> {selectedJobSeeker.previousJobExperience?.trim() || "N/A"}
              </p>
              <p>
                <strong>Certifications:</strong>{" "}
                {selectedJobSeeker.certifications?.length
                  ? selectedJobSeeker.certifications.map((cert, i) => (
                      <span key={i}>
                        {cert.name || JSON.stringify(cert)} {cert.year ? `(${cert.year})` : ""}{i < selectedJobSeeker.certifications.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : "N/A"}
              </p>
              <p>
                <strong>Expected Salary:</strong>{" "}
                {selectedJobSeeker.expectedSalaryMax != null
                  ? `$${selectedJobSeeker.expectedSalaryMax.toLocaleString()}`
                  : "N/A"}
              </p>
              <p>
                <strong>Preferred Location:</strong> {selectedJobSeeker.preferredLocation || "N/A"}
              </p>
              <p>
                <strong>Remote Preference:</strong> {selectedJobSeeker.remotePreference || "N/A"}
              </p>
              <p>
                <strong>LinkedIn:</strong>{" "}
                {selectedJobSeeker.linkedin ? (
                  <a href={selectedJobSeeker.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    View Profile
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>GitHub:</strong>{" "}
                {selectedJobSeeker.github ? (
                  <a href={selectedJobSeeker.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    View Profile
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Portfolio:</strong>{" "}
                {selectedJobSeeker.portfolio ? (
                  <a href={selectedJobSeeker.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    View Portfolio
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {selectedJobSeeker.skills && selectedJobSeeker.skills.length > 0
                  ? selectedJobSeeker.skills.join(", ")
                  : "N/A"}
              </p>
              <p>
                <strong>Education:</strong>{" "}
                {selectedJobSeeker.education
                  ? JSON.stringify(selectedJobSeeker.education)
                  : "N/A"}
              </p>
              {/* --- New Navigation for Viewing Applications --- */}
              <p className="mt-2">
                <Button
                  variant="link"
                  className="underline text-blue-400"
                  onClick={() =>
                    router.push(
                      `/dashboard/${recruiterId}/${companyid}/logs?jobSeekerId=${selectedJobSeeker.id}`
                    )
                  }
                >
                  View Applications
                </Button>
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={closeQuickView}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
