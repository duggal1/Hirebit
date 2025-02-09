"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Alert,
  //AlertCircle,
  AlertTitle,
  AlertDescription,
} from "@/app/_components/ui/alert";

const StatusMessage: React.FC<{ application: ApplicationData }> = ({ application }) => {
  const companyName = application.job?.company?.name || "Unknown Company";
  const companyLocation = application.job?.company?.location || "Unknown Location";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-1"
    >
      <div className="relative rounded-xl bg-black/40 backdrop-blur-xl p-6 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative">
          <p className="text-lg text-gray-200 leading-relaxed">
            Your application was {application.status.toLowerCase()} by{" "}
            <span className="font-medium text-purple-400">{companyName}</span> based in{" "}
            <span className="font-medium text-blue-400">{companyLocation}</span>.
            {application.status === "ACCEPTED" && (
              <span className="block mt-2 text-emerald-400">
                Congratulations! The company has accepted your application.
              </span>
            )}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-400">
              Last updated {new Date(application.lastActivity).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ------------------------------
// TYPES & INTERFACES
// ------------------------------

type ApplicationStatus =
  | "READY"
  | "NOT_READY"
  | "ACTIVE"
  | "PENDING"
  | "REVIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "ACCEPTED";

interface ApplicationData {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  jobSeekerId: string;
  job: {
    jobTitle: string;
    company: {
      name: string;
      location: string;
    } | null;
  } | null;
  isActive: boolean;
  lastActivity: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  active: number;
}

interface StatCardProps {
  label: string;
  value: number;
  className?: string;
}

interface ErrorProps {
  error: Error | null;
}

// ------------------------------
// COMPONENTS
// ------------------------------

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  REVIEWED: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  SHORTLISTED: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  REJECTED: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  ACCEPTED: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  READY: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  NOT_READY: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  ACTIVE: "bg-sky-400/10 text-sky-400 border-sky-400/20",
};

const StatCard: React.FC<StatCardProps> = ({ label, value, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card
      className={`p-6 rounded-3xl backdrop-blur-xl border-[0.5px] hover:border-opacity-50 transition-all duration-300 ${className}`}
    >
      <div className="relative overflow-hidden">
        <motion.p
          className="text-xs uppercase tracking-wider opacity-70 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>
        <motion.p
          className="text-4xl font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {value}
        </motion.p>
      </div>
    </Card>
  </motion.div>
);

const StatusBadge: React.FC<{ status: ApplicationStatus; isUpdating: boolean }> = ({
  status,
  isUpdating,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`
      ${statusColors[status]} 
      px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider
      border backdrop-blur-xl transition-all duration-300
      flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-current/20
    `}
  >
    {isUpdating ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : (
      <motion.div
        className="w-2 h-2 rounded-full bg-current"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
    {status.toLowerCase().replace("_", " ")}
  </motion.div>
);

const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-black/95 min-h-screen backdrop-blur-xl">
      <div className="space-y-8 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 via-transparent to-blue-500/20 blur-3xl" />
        {/* Modern animated loading spinner with multiple layers */}
        <div className="flex items-center justify-center h-48 relative">
          <div className="absolute h-32 w-32 bg-violet-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
            <div className="absolute inset-0 h-16 w-16 animate-ping opacity-20 bg-violet-500 rounded-full" />
          </div>
        </div>
        {/* Ultra-modern skeleton content with glass morphism */}
        <div className="space-y-6 relative backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
          {/* Title skeleton */}
          <div className="h-10 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 rounded-xl animate-pulse" />
          {/* Content skeletons with smooth transitions */}
          <div className="space-y-4">
            {[0.9, 0.7, 0.8, 0.75].map((width, i) => (
              <div
                key={i}
                className="h-4 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 rounded-full animate-pulse transition-all duration-500 ease-in-out hover:shadow-lg hover:shadow-violet-500/10"
                style={{ width: `${width * 100}%` }}
              />
            ))}
          </div>
          {/* Modern card skeletons with advanced hover effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[1, 2].map((i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:scale-110 opacity-0 group-hover:opacity-100" />
                <div
                  className="relative h-40 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl transition-all duration-300 
                  backdrop-blur-xl border border-white/10
                  group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-violet-500/20
                  overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<ErrorProps> = ({ error }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-black/95 min-h-screen backdrop-blur-xl">
      <div className="relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-orange-500/10 blur-3xl" />
        <Alert
          className="relative animate-in slide-in-from-top-2 duration-500 
          backdrop-blur-xl bg-gray-900/80 border border-red-500/20 
          shadow-lg shadow-red-500/10 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-20" />
          <div className="relative flex items-start space-x-4">
            <div className="relative mt-1">
              < Alert className="h-6 w-6 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
              <div className="absolute inset-0 animate-ping opacity-20 text-red-500" />
            </div>
            <div className="flex-1 space-y-2">
              <AlertTitle className="text-xl font-medium tracking-tight text-white/90">
                Something went wrong
              </AlertTitle>
              <AlertDescription className="text-base text-gray-400/90 leading-relaxed">
                {error?.message ||
                  "An unexpected error occurred. Please try again later."}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

// ------------------------------
// DASHBOARD PAGE COMPONENT
// ------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const applicationRes = await fetch(
          `/api/applications/${session.user.id}`
        );
        if (!applicationRes.ok) {
          throw new Error("Failed to fetch application");
        }
        const applicationData = await applicationRes.json();
        setApplication(applicationData);

        const statsRes = await fetch(
          `/api/applications/users/${session.user.id}`
        );
        if (!statsRes.ok) {
          throw new Error("Failed to fetch stats");
        }
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  const updateApplicationStatus = async (newStatus: ApplicationStatus) => {
    if (!application) return;

    setStatusLoading(true);
    try {
      const response = await fetch(
        `/api/applications/${application.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            isActive: newStatus === "ACTIVE",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedApplication = await response.json();
      setApplication(updatedApplication);
      toast.success("Status updated successfully", {
        className: "bg-zinc-900 text-zinc-100 border border-zinc-800",
      });
    } catch (error) {
      toast.error("Failed to update status", {
        className: "bg-zinc-900 text-zinc-100 border border-zinc-800",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!application) return null;

  const companyName = application.job?.company?.name || "Unknown Company";
  const companyLocation =
    application.job?.company?.location || "Unknown Location";

  return (
    <div className="min-h-screen bg-black text-zinc-100 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-900/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Status Message */}
          {application && <StatusMessage application={application} />}

          {/* Main Content Card */}
          <Card className="bg-zinc-900/30 backdrop-blur-2xl border-zinc-800/50 p-8 rounded-3xl">
            <div className="space-y-8">
              {/* Application Header */}
              <div className="flex justify-between items-start gap-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-4xl font-light tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    Application Status
                  </h1>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={application.status} isUpdating={statusLoading} />
                    {application.isActive && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active Now
                      </Badge>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
                    Status Update
                  </p>
                  <Select
                    value={application.status}
                    onValueChange={updateApplicationStatus}
                    disabled={statusLoading}
                  >
                    <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700/50 text-zinc-100 rounded-xl h-12">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="READY" className="text-teal-400">
                        Ready for Interview
                      </SelectItem>
                      <SelectItem value="NOT_READY" className="text-orange-400">
                        Not Ready
                      </SelectItem>
                      <SelectItem value="ACTIVE" className="text-sky-400">
                        Active Search
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
                    Applied On
                  </p>
                  <p className="text-xl font-light">
                    {new Date(application.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
                    Last Activity
                  </p>
                  <p className="text-xl font-light">
                    {new Date(application.lastActivity).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard
                label="Total Applications"
                value={stats.total}
                className="bg-zinc-900/30 border-zinc-800/50 text-zinc-100 hover:bg-zinc-800/40 transition-all duration-300"
              />
              <StatCard
                label="Pending"
                value={stats.pending}
                className="bg-amber-900/20 border-amber-500/30 text-amber-400 hover:bg-amber-900/30 transition-all duration-300"
              />
              <StatCard
                label="Accepted"
                value={stats.accepted}
                className="bg-emerald-900/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30 transition-all duration-300"
              />
              <StatCard
                label="Active"
                value={stats.active}
                className="bg-blue-900/20 border-blue-500/30 text-blue-400 hover:bg-blue-900/30 transition-all duration-300"
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>

  );
}
