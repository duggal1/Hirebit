"use client"

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { CodeProblem, EvaluationResult } from "@/types/code";
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart, CartesianGrid, Tooltip } from 'recharts';
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "@/app/_components/ui/use-toast";
import { CodeAnalysisCard } from "@/app/_components/CodeAnalysisCard";
import TechStackCard from "@/app/_components/TechStackCard";
import RealWorldAnalysisCard from "@/app/_components/RealWorldAnalysisCard";
import CodeQualityMetricsCard from '@/app/_components/CodeQualityMetricsCard';
import { AdditionalAnalysisCard } from "@/app/_components/AdditionalAnalysisCard";
//import { AdditionalAnalysisCard } from "@/app/_components/AdditionalAnalysisCard";


export default function Results() {
  const params = useParams();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [code, setCode] = useState<string>("");
  const [problem, setProblem] = useState<CodeProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Remove duplicate state
  // const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    try {
      const storedResult = localStorage.getItem(`evaluationResult-${params.id}`);
      const storedCode = localStorage.getItem(`submittedCode-${params.id}`);
      const storedProblem = localStorage.getItem(`problemDetails-${params.id}`);
      if (!params.id) {
        throw new Error("Invalid test ID");
      }
  
      if (!storedResult || !storedCode || !storedProblem) {
        throw new Error("Missing evaluation data");
      }
 try {   const parsedResult = JSON.parse(storedResult);
  const parsedProblem = JSON.parse(storedProblem);

  if (!parsedResult || typeof parsedResult.score !== 'number') {
    throw new Error("Invalid evaluation result");
  }

  setResult(parsedResult);
  setCode(storedCode);
  setProblem(parsedProblem);

} catch (parseError) {
  throw new Error("Invalid data format");
}
} catch (error) {
console.error("Error loading results:", error);
toast({
  title: "Error Loading Results",
  description: error instanceof Error ? error.message : "Failed to load evaluation results",
  variant: "destructive",
});
} finally {
setIsLoading(false);
}
}, [params.id, toast]);

     

  const metrics = useMemo(() => {
    if (!result) return [];
    
    return [
      {
        name: "Overall Score",
        value: Math.round(result.score), 
        color: "from-cyan-400 to-blue-500"
      },
      {
        name: "Problem Solving",
        value: Math.round(result.problemSolvingScore.score),
        color: "from-purple-400 to-pink-500"
      },
      {
        name: "Code Quality",
        value: Math.round(result.codeQualityScore.score),
        color: "from-green-400 to-emerald-500"
      },
      {
        name: "Technical Proficiency",
        value: Math.round(result.technicalProficiency.score),
        color: "from-yellow-400 to-orange-500"
      }
    ];
  }, [result]);

  if (isLoading) {
    return (
      <div className="relative bg-[#0A0A0A] min-h-screen text-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        
        <div className="relative space-y-8 mx-auto p-8 max-w-7xl animate-fadeIn">
          <div className="space-y-4 mb-12 text-center">
            <h1 className="bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-bold text-4xl text-transparent">
              Loading Results...
            </h1>
            <p className="text-gray-400">Please wait while we analyze your code</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="relative bg-[#0A0A0A] min-h-screen text-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        
        <div className="relative space-y-8 mx-auto p-8 max-w-7xl animate-fadeIn">
          <div className="space-y-4 mb-12 text-center">
            <h1 className="bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-bold text-4xl text-transparent">
              No Results Found
            </h1>
            <p className="text-gray-400">Please try again or contact support</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#030303] min-h-screen text-gray-100 overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Enhanced animated gradient background with blur */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 animate-gradient-slow" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-repeat" />
        <div className="absolute inset-0 bg-[#030303]/80 backdrop-blur-3xl" />
      </div>
      
      <div className="relative mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl animate-fadeIn">
        {/* Enhanced Header Section with Glow Effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-3 mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-cyan-400/30 animate-pulse-slow" />
              <div className="relative bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full w-2 h-2" />
            </div>
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              <span className="bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent">
                Code Analysis
              </span>
            </h1>
          </motion.div>
          <motion.p 
            className="mx-auto max-w-2xl text-gray-400 text-base sm:text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Comprehensive analysis of your code's quality, performance, and real-world applicability
          </motion.p>
        </motion.div>

        {/* Enhanced Score Overview with Modern Charts */}
        <div className="gap-6 sm:gap-8 grid grid-cols-1 lg:grid-cols-2 mb-12">
          {/* Modern Animated Area Chart with Glass Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="col-span-1 lg:col-span-2"
          >
            <Card className="relative group border-white/[0.05] hover:border-cyan-500/20 bg-black/30 backdrop-blur-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5 group-hover:opacity-50 transition-opacity duration-500" />
              <CardContent className="relative p-6 sm:p-8">
                <h3 className="mb-6 text-gray-300 text-lg sm:text-xl font-medium tracking-tight">Performance Overview</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl">
                                <p className="text-cyan-400 font-medium">{payload[0].payload.name}</p>
                                <p className="text-gray-300 font-bold text-lg">
                                  {payload[0].value} <span className="text-gray-500 text-sm">/ 100</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Animated Score Cards */}
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative group border-white/[0.05] hover:border-cyan-500/20 bg-black/30 backdrop-blur-xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5 group-hover:opacity-50 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <h3 className="mb-2 text-gray-400 text-sm font-medium">{metric.name}</h3>
                  <div className="flex items-end gap-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      className="flex items-end gap-2"
                    >
                      <span className="bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold text-3xl text-transparent">
                        {metric.value}
                      </span>
                      <span className="mb-1 text-gray-500 text-sm">/100</span>
                    </motion.div>
                  </div>
                  <motion.div
                    className="w-full h-1 mt-4 bg-gray-800/50 rounded-full overflow-hidden"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.7, delay: index * 0.1 + 0.4 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5, ease: "easeOut" }}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Analysis Grid */}
        {result && (
          <motion.div 
            className="gap-6 grid grid-cols-1 lg:grid-cols-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CodeAnalysisCard result={result} />
              <TechStackCard result={result} />
            </div>
            <div className="mt-6">
              <AdditionalAnalysisCard result={result} />
            </div>
            <RealWorldAnalysisCard analysis={result.realWorldAnalysis} />
            <CodeQualityMetricsCard metrics={result.codeQualityMetrics} />
          </motion.div>
        )}

        {/* Enhanced Overall Feedback Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="relative group border-white/[0.05] hover:border-cyan-500/20 bg-black/30 backdrop-blur-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 p-3 rounded-xl backdrop-blur-xl">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-semibold text-2xl text-transparent">
                  Overall Feedback
                </h2>
              </div>
              <p className="text-gray-300/90 leading-relaxed">{result.overallFeedback}</p>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Action Button */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <a 
            href="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
          >
            Analyze Another Code
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
