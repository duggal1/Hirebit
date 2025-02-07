import { Card } from "@/components/ui/card";
import { RealWorldAnalysis } from "@/types/code";
import { Globe, Briefcase, Building2, Users2, Rocket, ArrowRight } from "lucide-react";

interface RealWorldAnalysisCardProps {
  analysis: RealWorldAnalysis;
}

export default function RealWorldAnalysisCard({ analysis }: RealWorldAnalysisCardProps) {
  // Ensure analysis exists with default values
  const safeAnalysis = {
    targetIndustries: analysis?.targetIndustries || [],
    applicableProblems: analysis?.applicableProblems || [],
    requiredModifications: analysis?.requiredModifications || [],
    businessValue: analysis?.businessValue || '',
    isApplicable: analysis?.isApplicable || false
  };

  const sections = [
    {
      icon: Globe,
      title: "Target Industries",
      items: safeAnalysis.targetIndustries,
      color: "text-cyan-400",
    },
    {
      icon: Building2,
      title: "Applicable Problems",
      items: safeAnalysis.applicableProblems,
      color: "text-purple-400",
    },
    {
      icon: Users2,
      title: "Required Modifications",
      items: safeAnalysis.requiredModifications,
      color: "text-blue-400",
    },
    {
      icon: Rocket,
      title: "Business Value",
      items: safeAnalysis.businessValue ? [safeAnalysis.businessValue] : [],
      color: "text-green-400",
    },
  ];

  if (!safeAnalysis.isApplicable) {
    return (
      <Card className="relative overflow-hidden border border-white/[0.05] bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5" />
        <div className="relative p-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Real-World Analysis
              </span>
            </h2>
          </div>
          <p className="mt-4 text-gray-400">This solution is not directly applicable to real-world problems.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-white/[0.05] bg-black/20 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5" />
      <div className="relative p-6 space-y-8">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Real-World Analysis
            </span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-2">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                <h3 className="font-medium">{section.title}</h3>
              </div>
              {section.items.length > 0 ? (
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 shrink-0" />
                      <span className="text-sm text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No information available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
