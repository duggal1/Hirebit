import React from "react";
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
  if (!data?.basics?.name) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-blue-400 text-lg animate-pulse">Analyzing portfolio...</div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="bg-[#050508] min-h-screen p-4 md:p-8 space-y-6 text-slate-200">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-[#0A0A0F] to-[#12121F] border-none rounded-3xl shadow-xl backdrop-blur-xl p-8">
        <div className="space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {data.basics.name}
          </h2>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-xl text-blue-300">{data.basics.title}</span>
            <span className="hidden md:block text-slate-500">•</span>
            <span className="text-slate-400">{data.basics.location}</span>
          </div>
          {data.basics.bio && (
            <p className="text-slate-300 leading-relaxed max-w-3xl">{data.basics.bio}</p>
          )}
        </div>
      </Card>

      {/* Analysis Score Card */}
      <Card className="bg-[#0A0A0F] border-none rounded-3xl shadow-xl p-8 space-y-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-slate-100">Portfolio Analysis</h3>
          
          {/* Main Score */}
          <div className="relative pt-6 pb-8">
            <Progress 
              value={analysis.insights.score} 
              className="h-2 rounded-full bg-slate-800"
            />
            <span className={`absolute right-0 top-0 font-mono text-2xl ${getScoreColor(analysis.insights.score)}`}>
              {analysis.insights.score}
            </span>
          </div>

          {/* Critical Issues Section */}
          {Object.entries(analysis.insights.criticalFlags).some(([_, value]) => value) && (
            <div className="space-y-4 p-6 bg-black/20 rounded-2xl backdrop-blur">
              <h4 className="text-xl font-medium text-rose-400">Critical Issues</h4>
              <div className="space-y-3">
                {Object.entries(analysis.insights.criticalFlags)
                  .filter(([_, value]) => value)
                  .map(([key], idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                      <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                      <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Skills Analysis */}
          {analysis.insights.skillsAnalysis.issues.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-medium text-slate-100">Skills Focus</h4>
                <Badge className="bg-blue-500/10 text-blue-400 border-none px-3 py-1">
                  {analysis.insights.skillsAnalysis.focusScore}/100
                </Badge>
              </div>

              {analysis.insights.skillsAnalysis.missingCoreSkills.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">Missing Core Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.insights.skillsAnalysis.missingCoreSkills.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-amber-500/10 text-amber-400 border-none"
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
            <div className="space-y-4 p-6 bg-slate-900/30 rounded-2xl">
              <h4 className="text-xl font-medium text-slate-100">Content Review</h4>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-3">Overused Terms</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.insights.contentIssues.buzzwords.map((word, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-purple-500/10 text-purple-400 border-none"
                      >
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>

                {analysis.insights.contentIssues.overclaimedSkills.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-3">Skills to Verify</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.insights.contentIssues.overclaimedSkills.map((skill, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-rose-500/10 text-rose-400 border-none"
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
                    className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-xl hover:bg-blue-500/10 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-blue-400" />
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