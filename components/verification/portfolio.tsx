"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

// Keeping the interfaces the same...
interface PortfolioData {
  basics: {
    name: string;
    title: string;
    location: string;
    bio: string;
    roles: string[];
  };
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    liveUrl?: string;
    sourceUrl?: string;
  }>;
  skills: {
    technical: string[];
    softSkills: string[];
    frameworks: string[];
    languages: string[];
  };
}

interface PortfolioAnalysis {
  strengths: string[];
  weaknesses: string[];
  insights: {
    score: number;
    roleClarity: {
      score: number;
      issues: string[];
      suggestedRole: string;
    };
    projectQuality: {
      score: number;
      issues: string[];
      suggestions: string[];
      hasLiveDemo: boolean;
      hasSourceCode: boolean;
    };
    bioAnalysis: {
      isOptimal: boolean;
      wordCount: number;
      issues: string[];
      suggestions: string[];
    };
    skillsAnalysis: {
      focusScore: number;
      issues: string[];
      redundantSkills: string[];
      missingCoreSkills: string[];
    };
    contentIssues: {
      buzzwords: string[];
      overusedTerms: string[];
      spamKeywords: string[];
      overclaimedSkills: string[];
    };
    criticalFlags: {
      noProjects: boolean;
      multipleRoles: boolean;
      inconsistentInfo: boolean;
      outdatedTech: boolean;
      poorPresentation: boolean;
    };
    improvements: string[];
  };
}

interface PortfolioResultsProps {
  data: PortfolioData;
  analysis: PortfolioAnalysis;
}


export function PortfolioResults({ data, analysis }: PortfolioResultsProps) {

  const [isError, setIsError] = useState(false);
 
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!data?.basics?.name) {
        setIsError(true);
      }
    }, 20000); // Show error after 30 seconds

    return () => clearTimeout(timer);
  }, [data]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-rose-400 text-lg">
          Analysis failed. Please try again.
        </div>
      </div>
    );
  }
  
  if (!data?.basics?.name) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
        <div className="text-blue-400 text-lg animate-pulse">
          Analyzing portfolio... Please wait 
        </div>
        <div className="text-slate-400 text-sm">
          This may take a few moments
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="bg-[#030307] min-h-screen p-4 md:p-8 space-y-8 text-slate-200">
      {/* Header Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#080810] to-[#0C0C1A] border-none rounded-3xl shadow-2xl p-8 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative space-y-6">
          <div className="space-y-2">
            <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              {data.basics.name}
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-xl bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
                {data.basics.title}
              </span>
              <span className="hidden md:block text-slate-600">◆</span>
              <span className="text-slate-400">{data.basics.location}</span>
            </div>
          </div>
          
          {data.basics.bio && (
            <p className="text-slate-300 leading-relaxed max-w-3xl text-lg">{data.basics.bio}</p>
          )}
        </div>
      </Card>

      {/* Analysis Score Card */}
      <Card className="relative overflow-hidden bg-[#060610] border-none rounded-3xl shadow-2xl p-8 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        
        <div className="relative space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-semibold text-slate-100">Portfolio Analysis</h3>
            <div className={`text-4xl font-mono font-bold ${getScoreColor(analysis.insights.score)}`}>
              {analysis.insights.score}
            </div>
          </div>
          
          {/* Main Score */}
          <div className="relative">
            <Progress 
              value={analysis.insights.score} 
              className="h-1.5 rounded-full bg-slate-800/50"
            />
          </div>

          {/* Critical Issues Section */}
          {Object.entries(analysis.insights.criticalFlags).some(([_, value]) => value) && (
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-red-500/10" />
              <div className="relative space-y-4 p-6">
                <h4 className="text-xl font-medium text-rose-400">Critical Issues</h4>
                <div className="space-y-3">
                  {Object.entries(analysis.insights.criticalFlags)
                    .filter(([_, value]) => value)
                    .map(([key], idx) => (
                      <div key={idx} 
                        className="flex items-center gap-3 p-3 bg-black/20 rounded-xl backdrop-blur-sm hover:bg-black/30 transition-colors">
                        <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                        <span className="text-slate-300">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}


<div className="grid md:grid-cols-2 gap-6">
  {/* Strengths */}
  <div className="space-y-4 p-6 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl backdrop-blur-sm">
    <h4 className="text-xl font-medium text-emerald-400">Strengths</h4>
    <div className="space-y-3">
      {analysis.strengths.map((strength, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-300">{strength}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Weaknesses */}
  <div className="space-y-4 p-6 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl backdrop-blur-sm">
    <h4 className="text-xl font-medium text-amber-400">Areas to Improve</h4>
    <div className="space-y-3">
      {analysis.weaknesses.map((weakness, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <span className="text-slate-300">{weakness}</span>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Role Analysis */}
{analysis.insights.roleClarity.issues.length > 0 && (
  <div className="space-y-4 p-6 bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-2xl backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <h4 className="text-xl font-medium text-slate-100">Role Clarity</h4>
      <Badge className="bg-blue-500/10 text-blue-400 border-none px-4 py-1.5">
        {analysis.insights.roleClarity.score}/100
      </Badge>
    </div>
    
    <div className="space-y-4">
      {/* Role Issues */}
      <div>
        <p className="text-sm text-slate-400 mb-3">Issues Found</p>
        <div className="space-y-2">
          {analysis.insights.roleClarity.issues.map((issue, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span className="text-slate-300">{issue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Role */}
      {analysis.insights.roleClarity.suggestedRole && (
        <div className="mt-4 p-4 bg-blue-500/10 rounded-xl">
          <p className="text-sm text-slate-400 mb-2">Suggested Focus Role</p>
          <p className="text-blue-400 font-medium">
            {analysis.insights.roleClarity.suggestedRole}
          </p>
        </div>
      )}
    </div>
  </div>
)}

{/* Project Analysis */}
{analysis.insights.projectQuality.issues.length > 0 && (
  <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <h4 className="text-xl font-medium text-slate-100">Project Quality</h4>
      <Badge className="bg-indigo-500/10 text-indigo-400 border-none px-4 py-1.5">
        {analysis.insights.projectQuality.score}/100
      </Badge>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className={`p-4 rounded-xl ${analysis.insights.projectQuality.hasLiveDemo ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
        <p className="text-sm text-slate-400 mb-2">Live Demos</p>
        <p className={`font-medium ${analysis.insights.projectQuality.hasLiveDemo ? 'text-emerald-400' : 'text-rose-400'}`}>
          {analysis.insights.projectQuality.hasLiveDemo ? 'Available' : 'Not Found'}
        </p>
      </div>

      <div className={`p-4 rounded-xl ${analysis.insights.projectQuality.hasSourceCode ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
        <p className="text-sm text-slate-400 mb-2">Source Code</p>
        <p className={`font-medium ${analysis.insights.projectQuality.hasSourceCode ? 'text-emerald-400' : 'text-rose-400'}`}>
          {analysis.insights.projectQuality.hasSourceCode ? 'Available' : 'Not Found'}
        </p>
      </div>
    </div>

    {analysis.insights.projectQuality.suggestions.length > 0 && (
      <div>
        <p className="text-sm text-slate-400 mb-3">Suggested Improvements</p>
        <div className="space-y-2">
          {analysis.insights.projectQuality.suggestions.map((suggestion, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              <span className="text-slate-300">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

{/* Bio Analysis */}
{analysis.insights.bioAnalysis.issues.length > 0 && (
  <div className="space-y-4 p-6 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-2xl backdrop-blur-sm">
    <h4 className="text-xl font-medium text-slate-100">Bio Analysis</h4>
    
    <div className="flex items-center gap-4">
      <div className="p-4 bg-violet-500/10 rounded-xl flex-1">
        <p className="text-sm text-slate-400 mb-2">Word Count</p>
        <p className="font-medium text-violet-400">{analysis.insights.bioAnalysis.wordCount} words</p>
      </div>
      <div className="p-4 bg-violet-500/10 rounded-xl flex-1">
        <p className="text-sm text-slate-400 mb-2">Quality</p>
        <p className="font-medium text-violet-400">
          {analysis.insights.bioAnalysis.isOptimal ? 'Optimal' : 'Needs Improvement'}
        </p>
      </div>
    </div>

    {analysis.insights.bioAnalysis.suggestions.length > 0 && (
      <div>
        <p className="text-sm text-slate-400 mb-3">Suggestions</p>
        <div className="space-y-2">
          {analysis.insights.bioAnalysis.suggestions.map((suggestion, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-violet-400 flex-shrink-0" />
              <span className="text-slate-300">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
     

          {/* Skills Analysis */}
          {analysis.insights.skillsAnalysis.issues.length > 0 && (
            <div className="space-y-6 p-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-medium text-slate-100">Skills Focus</h4>
                <Badge className="bg-blue-500/10 text-blue-400 border-none px-4 py-1.5 text-sm font-medium">
                  {analysis.insights.skillsAnalysis.focusScore}/100
                </Badge>
              </div>

              {analysis.insights.skillsAnalysis.missingCoreSkills.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Missing Core Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.insights.skillsAnalysis.missingCoreSkills.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-amber-500/10 text-amber-400 border-none px-3 py-1 hover:bg-amber-500/20 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Issues */}
          {analysis.insights.contentIssues.buzzwords.length > 0 && (
            <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl backdrop-blur-sm">
              <h4 className="text-xl font-medium text-slate-100">Content Review</h4>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400 mb-4">Overused Terms</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.insights.contentIssues.buzzwords.map((word, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-purple-500/10 text-purple-400 border-none hover:bg-purple-500/20 transition-colors"
                      >
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>

                {analysis.insights.contentIssues.overclaimedSkills.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-4">Skills to Verify</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.insights.contentIssues.overclaimedSkills.map((skill, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-rose-500/10 text-rose-400 border-none hover:bg-rose-500/20 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Improvements */}
          {analysis.insights.improvements.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xl font-medium text-slate-100">Recommended Actions</h4>
              <div className="grid gap-3">
                {analysis.insights.improvements.map((improvement, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center gap-3 p-4 bg-blue-500/5 rounded-xl hover:bg-blue-500/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    <span className="text-slate-300">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PortfolioResults;