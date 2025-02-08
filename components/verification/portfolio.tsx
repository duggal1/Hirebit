import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import React from "react";
import {
  Check,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

interface SimplePortfolioAnalysis {
  data: {
    basics: {
      name: string;
      title: string;
      location: string;
    };
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
    technologies: string[];
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    insights: {
      score: number;
      buzzwords: string[];
      criticalFlaws: string[];
      improvements: string[];
    };
  };
}

export function PortfolioResults({ data, analysis }: SimplePortfolioAnalysis) {
  if (!data?.basics?.name) {
    return <div className="p-8 text-center">Analyzing portfolio...</div>;
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-8 space-y-8">
      {/* Basic Info */}
      <Card className="bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold">{data.basics.name}</h2>
        <p className="text-blue-400 text-xl mt-1">{data.basics.title}</p>
        <p className="text-gray-400 mt-2">{data.basics.location}</p>
      </Card>

      {/* Key Insights */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Strengths */}
        <Card className="bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold mb-4 text-green-400">Portfolio Strengths</h3>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-400" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses */}
        <Card className="bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Areas for Improvement</h3>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Critical Analysis */}
      <Card className="bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">Portfolio Score</h3>
          <Progress value={analysis.insights.score} className="h-3" />
          <p className="mt-2 text-gray-400">{analysis.insights.score}/100</p>
        </div>

        {analysis.insights.criticalFlaws.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3 text-red-400">Critical Issues</h4>
            <ul className="space-y-2">
              {analysis.insights.criticalFlaws.map((flaw, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span>{flaw}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.insights.buzzwords.length > 0 && (
          <div>
            <h4 className="text-xl font-semibold mb-3">Buzzwords Detected</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.insights.buzzwords.map((word, idx) => (
                <Badge key={idx} variant="secondary">{word}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}