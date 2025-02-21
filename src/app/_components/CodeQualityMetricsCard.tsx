
import { CodeQualityMetrics } from "@/src/types/code";
import { Book, GitBranch, Code2, FileCode2, TestTube2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Card } from "@/components/ui/card";


interface CodeQualityMetricsCardProps {
  metrics: CodeQualityMetrics;
}

export default function CodeQualityMetricsCard({ metrics }: CodeQualityMetricsCardProps) {
  const sections = [
    {
      icon: Book,
      title: "Readability",
      score: metrics.readabilityScore,
      description: metrics.readabilityAnalysis,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: GitBranch,
      title: "Maintainability",
      score: metrics.maintainabilityScore,
      description: metrics.maintainabilityAnalysis,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Code2,
      title: "Consistency",
      score: metrics.consistencyScore,
      description: metrics.consistencyAnalysis,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: FileCode2,
      title: "Documentation",
      score: metrics.documentationScore,
      description: metrics.documentationAnalysis,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: TestTube2,
      title: "Testing",
      score: metrics.testingScore,
      description: metrics.testingAnalysis,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <Card className="relative overflow-hidden border border-white/[0.05] bg-black/20 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5" />
      <div className="relative p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
            <Code2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Code Quality Metrics
            </span>
          </h2>
        </div>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${section.bgColor} backdrop-blur-xl border border-white/[0.05] space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <section.icon className={`w-5 h-5 bg-gradient-to-r ${section.color} bg-clip-text text-transparent`} />
                  <h3 className="font-medium">{section.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                <Progress 
  value={section.score} 
  className="w-24 h-2 bg-white/[0.05]"
  // If your Progress component uses a different prop name for the indicator class
  // use that instead, for example:
  //progressIndicatorClassName={`bg-gradient-to-r ${section.color}`}
  // or
  //indicatorStyles={`bg-gradient-to-r ${section.color}`}
/>
                  <span className="text-sm font-medium text-white/80">
                    {section.score}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {section.description.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-gray-400 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
