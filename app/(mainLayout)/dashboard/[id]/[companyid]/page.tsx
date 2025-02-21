"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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
import ModernVisualizations from "@/components/charts/dashboard/recuiter/charts";

// ChartJS registration
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

  // --- Prepare Chart Data for UltraModernVisualizations ---
  const chartData = useMemo(() => {
    if (!aggregatedMetrics || !metrics) return null;

    const lineData = {
      labels: Object.keys(aggregatedMetrics.viewsByDate).sort(),
      datasets: [{
        label: "Views Over Time",
        data: Object.keys(aggregatedMetrics.viewsByDate)
          .sort()
          .map(date => aggregatedMetrics.viewsByDate[date])
      }]
    };

    const barData = {
      labels: metrics.map(m => m.jobTitle),
      datasets: [{
        label: "Views per Job Post",
        data: metrics.map(m => m.metrics.views)
      }]
    };

    const pieData = {
      labels: ["Total Clicks", "Remaining Views"],
      datasets: [{
        data: [
          aggregatedMetrics.totalClicks,
          aggregatedMetrics.totalViews - aggregatedMetrics.totalClicks
        ]
      }]
    };

    return { lineData, barData, pieData };
  }, [aggregatedMetrics, metrics]);

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
    <div className="min-h-screen bg-[#030712] text-neutral-100 p-8">
      {/* Page Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between mb-12"
      >
        <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500">
          Recruiter Dashboard
        </h1>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4 sm:mt-0 bg-black border-blue-600 hover:bg-blue-800/50 transition-all duration-300 text-neutral-200"
        >
          Refresh Data
        </Button>
      </motion.header>

      {/* --- Dashboard Metrics Section --- */}
      <section className="mb-16">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8 text-gray-100"
        >
          Dashboard Metrics
        </motion.h2>
        {loadingMetrics ? (
          <div className="text-center py-10">Loading metrics...</div>
        ) : aggregatedMetrics ? (
          <>
            {/* KPI Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              {[
                { title: "Total Views", value: aggregatedMetrics.totalViews, gradient: "from-blue-400 to-indigo-500" },
                { title: "Total Clicks", value: aggregatedMetrics.totalClicks, gradient: "from-purple-400 to-fuchsia-500" },
                { title: "Applications", value: aggregatedMetrics.totalApplications, gradient: "from-pink-400 to-rose-500" },
                { title: "CTR", value: `${aggregatedMetrics.ctr.toFixed(2)}%`, gradient: "from-amber-400 to-orange-500" },
                { title: "Conversion Rate", value: `${aggregatedMetrics.conversionRate.toFixed(2)}%`, gradient: "from-emerald-400 to-teal-500" },
                { title: "Job Seekers", value: jobSeekers ? jobSeekers.length : 0, gradient: "from-cyan-400 to-sky-500" }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-black backdrop-blur-xl border border-blue-800/50 rounded-3xl overflow-hidden hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-white/80">{metric.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${metric.gradient} transition-all duration-300 group-hover:scale-105`}>
                        {metric.value}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Section */}
            {chartData && (
              <ModernVisualizations
                lineData={chartData.lineData}
                barData={chartData.barData}
                pieData={chartData.pieData}
              />
            )}
          </>
        ) : (
          <p className="text-center py-10 text-pink-800 ">No data about your clients found 😥.</p>
        )}
      </section>
    

      {/* --- Job Seekers Section --- */}
      <section className="relative min-h-screen bg-[#030712] p-8">
      {/* Ambient background effects */}
      <div className="fixed inset-0 bg-[url('/api/placeholder/10/10')] opacity-[0.015] bg-repeat pointer-events-none" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />

      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-extrabold mb-8 relative"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400">
          Clients
        </span>
        <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
      </motion.h2>

      {loadingJobSeekers ? (
        <div className="flex items-center justify-center h-64 space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-violet-400 rounded-full animate-bounce delay-100" />
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-200" />
        </div>
      ) : jobSeekers && jobSeekers.length > 0 ? (
        <Card className="relative bg-black/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-violet-500/5 to-transparent pointer-events-none" />
          
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                  {[
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "location", label: "Location" },
                    { key: "yearsOfExperience", label: "Experience (Years)" },
                    { key: "applications", label: "Applications" },
                    { key: "actions", label: "Quick View" }
                  ].map((column) => (
                    <TableHead
                      key={column.key}
                      className="text-white/70 cursor-pointer hover:text-blue-400 transition-colors font-medium tracking-wide text-sm"
                      onClick={() => column.key !== "actions" && requestSort(column.key as keyof JobSeeker)}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobSeekers.map((seeker) => (
                  <TableRow
                    key={seeker.id}
                    className="border-white/5 hover:bg-white/5 transition-all duration-300 group"
                  >
                    <TableCell className="font-medium text-white/90">{seeker.name}</TableCell>
                    <TableCell className="text-white/70">{seeker.email}</TableCell>
                    <TableCell className="text-white/70">{seeker.location}</TableCell>
                    <TableCell className="text-white/70">
                      {seeker.yearsOfExperience != null ? seeker.yearsOfExperience : "N/A"}
                    </TableCell>
                    <TableCell className="text-white/70">{seeker.applications?.length || 0}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openQuickView(seeker)}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-[0.5px] border-blue-500/20 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 rounded-lg"
                      >
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                          Quick View
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      ) : (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-indigo-500/10" />
          <p className="relative text-center py-10 text-lg font-medium text-white/70">
            No clients yet. Time to expand your network! ✨
          </p>
        </div>
      )}
    </section>
      {/* --- Quick View Modal for Job Seeker Details --- */}
      <AnimatePresence>
      {selectedJobSeeker && (
        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeQuickView(); }}>
          <DialogContent className="bg-[#030712] border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] rounded-3xl max-w-4xl max-h-[85vh] overflow-y-auto backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-indigo-900/10 to-purple-900/10 rounded-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/api/placeholder/10/10')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
            
            <DialogHeader className="space-y-4 relative">
              <DialogTitle className="text-3xl font-black">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  {selectedJobSeeker.name}
                </span>
              </DialogTitle>
              <div className="flex gap-4 flex-wrap">
                {selectedJobSeeker.jobSearchStatus && (
                  <span className="px-4 py-1.5 rounded-full bg-indigo-950/30 text-indigo-200 text-sm font-medium border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                    {selectedJobSeeker.jobSearchStatus}
                  </span>
                )}
                {selectedJobSeeker.remotePreference && (
                  <span className="px-4 py-1.5 rounded-full bg-blue-950/30 text-blue-200 text-sm font-medium border border-blue-500/20 shadow-lg shadow-blue-500/10">
                    {selectedJobSeeker.remotePreference}
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-6 relative">
              {/* Contact & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Email", value: selectedJobSeeker.email, icon: "📧" },
                  { label: "Phone", value: selectedJobSeeker.phoneNumber || "N/A", icon: "📱" },
                  { label: "Location", value: selectedJobSeeker.location, icon: "📍" },
                  { label: "Current Job Title", value: selectedJobSeeker.currentJobTitle || "N/A", icon: "💼" },
                  { label: "Industry", value: selectedJobSeeker.industry || "N/A", icon: "🏢" },
                  { label: "Years of Experience", value: selectedJobSeeker.yearsOfExperience != null ? selectedJobSeeker.yearsOfExperience : "N/A", icon: "⏳" },
                  { label: "Expected Salary", value: selectedJobSeeker.expectedSalaryMax != null ? `$${selectedJobSeeker.expectedSalaryMax.toLocaleString()}` : "N/A", icon: "💰" },
                  { label: "Preferred Location", value: selectedJobSeeker.preferredLocation || "N/A", icon: "🌎" }
                ].map((field, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-[#0A0F1A]/40 border border-indigo-500/10 backdrop-blur-sm hover:bg-indigo-950/20 transition-all duration-300 group shadow-lg shadow-indigo-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl group-hover:scale-110 transition-transform duration-300">{field.icon}</span>
                      <div>
                        <p className="text-indigo-200/80 text-base font-medium mb-1">{field.label}</p>
                        <p className="text-white/90 font-semibold">{field.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Detailed Information */}
              <div className="space-y-6">
                {/* Bio Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-[#0A0F1A]/40 border border-blue-500/10 backdrop-blur-sm hover:bg-blue-950/20 transition-all duration-300 shadow-lg shadow-blue-500/5"
                >
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
                    Professional Summary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-200/80 text-sm mb-2">Bio</p>
                      <p className="text-white/80">{selectedJobSeeker.bio?.trim() || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-blue-200/80 text-sm mb-2">About</p>
                      <p className="text-white/80">{selectedJobSeeker.about?.trim() || "N/A"}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Experience Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-[#0A0F1A]/40 border border-purple-500/10 backdrop-blur-sm hover:bg-purple-950/20 transition-all duration-300 shadow-lg shadow-purple-500/5"
                >
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                    Work Experience
                  </h3>
                  <p className="text-white/80">{selectedJobSeeker.previousJobExperience?.trim() || "N/A"}</p>
                </motion.div>

                {/* Skills Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-[#0A0F1A]/40 border border-indigo-500/10 backdrop-blur-sm hover:bg-indigo-950/20 transition-all duration-300 shadow-lg shadow-indigo-500/5"
                >
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 mb-4">
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJobSeeker.skills && selectedJobSeeker.skills.length > 0 ? (
                      selectedJobSeeker.skills.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-2 rounded-full bg-[#0A0F1A]/60 border border-indigo-500/20 text-indigo-200 font-medium hover:bg-indigo-950/30 hover:border-indigo-500/40 transition-all duration-300 shadow-lg shadow-indigo-500/5"
                        >
                          {skill}
                        </motion.span>
                      ))
                    ) : (
                      "N/A"
                    )}
                  </div>
                </motion.div>

                {/* Professional Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: "LinkedIn", url: selectedJobSeeker.linkedin, icon: "🔗" },
                    { type: "GitHub", url: selectedJobSeeker.github, icon: "💻" },
                    { type: "Portfolio", url: selectedJobSeeker.portfolio, icon: "🎨" }
                  ].map((link, index) => (
                    link.url && (
                      <motion.a
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl bg-[#0A0F1A]/40 border border-blue-500/10 backdrop-blur-sm hover:bg-blue-950/20 transition-all duration-300 flex items-center justify-center gap-2 text-blue-200 font-medium group shadow-lg shadow-blue-500/5"
                      >
                        <span className="group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                          View {link.type}
                        </span>
                      </motion.a>
                    )
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-indigo-500/20">
                <Button
                  variant="outline"
                  className="bg-[#0A0F1A]/60 border-indigo-500/30 hover:bg-indigo-950/30 text-indigo-200 px-6 shadow-lg shadow-indigo-500/10 transition-all duration-300"
                  onClick={() => router.push(`/dashboard/${recruiterId}/${companyid}/logs?jobSeekerId=${selectedJobSeeker.id}`)}
                >
                  View Applications
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#0A0F1A]/60 border-purple-500/30 hover:bg-purple-950/30 text-purple-200 px-6 shadow-lg shadow-purple-500/10 transition-all duration-300"
                  onClick={closeQuickView}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
    </div>
  );
}