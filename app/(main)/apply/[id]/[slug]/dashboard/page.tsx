"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface ApplicationStats {
	total: number;
	pending: number;
	accepted: number;
	rejected: number;
	active: number;
}

interface ApplicationData {
	id: string;
	status: string;
	createdAt: string;
	job: {
		jobTitle: string;
		company: {
			name: string;
			location: string;
		}
	}
	isActive: boolean;
	lastActivity: string;
}

export default function DashboardPage() {
	const params = useParams();
	const [application, setApplication] = useState<ApplicationData | null>(null);
	const [stats, setStats] = useState<ApplicationStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [applicationRes, statsRes] = await Promise.all([
					fetch(`/api/applications/${params.id}`),
					fetch(`/api/applications/user/${params.id}`)
				]);
				
				const applicationData = await applicationRes.json();
				const statsData = await statsRes.json();
				
				setApplication(applicationData);
				setStats(statsData.stats);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [params.id]);

	if (loading) {
		return <LoadingSkeleton />;
	}

	const getStatusBadge = (status: string) => {
		const statusColors: Record<string, string> = {
			PENDING: "bg-yellow-500",
			REVIEWED: "bg-blue-500",
			SHORTLISTED: "bg-green-500",
			REJECTED: "bg-red-500",
			ACCEPTED: "bg-purple-500",
			READY: "bg-emerald-500",
			NOT_READY: "bg-orange-500",
			ACTIVE: "bg-cyan-500"
		};

		return (
			<Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
				{status.toLowerCase().replace("_", " ")}
			</Badge>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
			<ScrollArea className="h-screen">
				<div className="max-w-4xl mx-auto p-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-8"
					>
						{application && (
							<>
								<Card className="bg-white/5 border-white/10 p-8 rounded-xl">
									<div className="space-y-6">
										<div className="flex justify-between items-start">
											<div>
												<h1 className="text-3xl font-bold mb-2">Application Status</h1>
												<p className="text-gray-400">
													Your letter was successfully sent to {application.job.company.name} based in {application.job.company.location}. 
													We will let you know when they respond back.
												</p>
											</div>
											<div className="space-y-2">
												{getStatusBadge(application.status)}
												{application.isActive && (
													<Badge className="ml-2 bg-green-500/10 text-green-400">
														Active Now
													</Badge>
												)}
											</div>
										</div>

										<div className="grid grid-cols-2 gap-6">
											<div>
												<h3 className="text-sm text-gray-400 mb-1">Position</h3>
												<p className="font-medium">{application.job.jobTitle}</p>
											</div>
											<div>
												<h3 className="text-sm text-gray-400 mb-1">Applied On</h3>
												<p className="font-medium">
													{new Date(application.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>

										<div className="bg-white/5 p-4 rounded-lg">
											<h3 className="text-sm text-gray-400 mb-2">Status Timeline</h3>
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<div className="w-2 h-2 bg-green-500 rounded-full" />
													<p>Application Submitted</p>
													<p className="text-gray-400 text-sm ml-auto">
														{new Date(application.createdAt).toLocaleDateString()}
													</p>
												</div>
												<div className="flex items-center space-x-2">
													<div className="w-2 h-2 bg-blue-500 rounded-full" />
													<p>Last Activity</p>
													<p className="text-gray-400 text-sm ml-auto">
														{new Date(application.lastActivity).toLocaleDateString()}
													</p>
												</div>
											</div>
										</div>
									</div>
								</Card>

								{stats && (
									<Card className="bg-white/5 border-white/10 p-6 rounded-xl">
										<h2 className="text-xl font-semibold mb-4">Application Overview</h2>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
											<div className="p-4 bg-white/5 rounded-lg">
												<div className="text-sm text-gray-400">Total Applications</div>
												<div className="text-2xl font-bold">{stats.total}</div>
											</div>
											<div className="p-4 bg-white/5 rounded-lg">
												<div className="text-sm text-gray-400">Pending</div>
												<div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
											</div>
											<div className="p-4 bg-white/5 rounded-lg">
												<div className="text-sm text-gray-400">Accepted</div>
												<div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
											</div>
											<div className="p-4 bg-white/5 rounded-lg">
												<div className="text-sm text-gray-400">Active</div>
												<div className="text-2xl font-bold text-blue-500">{stats.active}</div>
											</div>
										</div>
									</Card>
								)}
							</>
						)}
					</motion.div>
				</div>
			</ScrollArea>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
			<div className="max-w-4xl mx-auto">
				<Skeleton className="h-12 w-2/3 mb-4" />
				<Skeleton className="h-4 w-1/2 mb-8" />
				<Skeleton className="h-[400px] w-full rounded-xl" />
			</div>
		</div>
	);
}