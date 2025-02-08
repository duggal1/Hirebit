import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { Star, GitFork, CheckCircle2, XCircle } from "lucide-react"; 

interface VerificationStatus {
  isVerified: boolean;
  message: string;
}

interface GithubProfile {
  name: string;
  bio: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface Repository {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface CommitStats {
  total_commits: number;
  contributions_this_year: number;
  streak_days: number;
  contribution_history: Array<{
    date: string;
    count: number;
  }>;
}

interface GithubResultsProps {
  data: {
    profile: GithubProfile;
    repositories: Repository[];
    commitStats: CommitStats;
    verification: VerificationStatus;
  };
}

// Moved VerificationBadge component outside of GithubResults
const VerificationBadge = ({ verification }: { verification: VerificationStatus }) => {
  // Remove the null check since we're already checking in the parent
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-black/40 backdrop-blur-xl border-zinc-800/50 mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            {verification.isVerified ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-zinc-200">
                {verification.isVerified ? "Verified Account" : "Verification Status"}
              </h3>
              <p className="text-zinc-400 text-sm">{verification.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function GithubResults({ data }: GithubResultsProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  console.log('Received data:', data);
  {console.log('Verification data:', data.verification)}
  
  const statCards = [
    { label: "Repositories", value: data.profile.public_repos },
    { label: "Followers", value: data.profile.followers },
    { label: "Following", value: data.profile.following },
    { label: "Day Streak", value: data.commitStats.streak_days }
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <Card className="bg-black/40 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-xl" />
                <img 
                  src={data.profile.avatar_url} 
                  alt={data.profile.name} 
                  className="relative w-20 h-20 rounded-full ring-2 ring-violet-500/20"
                />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  {data.profile.name}
                </CardTitle>
                <p className="text-zinc-400">{data.profile.bio}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-4 text-center space-y-1">
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      
        {data.verification && (
        <VerificationBadge 
          verification={data.verification} 
        />
        )}
     
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
        <Card className="bg-black/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Contribution Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.commitStats.contribution_history}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    stroke="#525252"
                    tick={{ fill: '#525252' }}
                  />
                  <YAxis 
                    stroke="#525252"
                    tick={{ fill: '#525252' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)'
                    }}
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value) => [`${value} commits`, 'Commits']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-200">Recent Projects</h3>
        {data.repositories.map((repo, index) => (
          <motion.div
            key={repo.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group bg-black/40 backdrop-blur-xl border-zinc-800/50 hover:bg-zinc-900/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <a 
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 hover:text-violet-400 transition-colors duration-200"
                  >
                    {repo.name}
                  </a>
                  <div className="flex items-center space-x-3">
                    {repo.language && (
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                        {repo.language}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-4 text-zinc-500">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitFork className="h-4 w-4" />
                        <span>{repo.forks_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mt-2">{repo.description}</p>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default GithubResults;
