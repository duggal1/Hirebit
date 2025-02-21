import { Card, CardContent } from "@/components/ui/card";
import { EvaluationResult } from "@/src/types/code";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Book, Lightbulb, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";

interface AdditionalAnalysisCardProps {
  result: EvaluationResult;
}

export function AdditionalAnalysisCard({ result }: AdditionalAnalysisCardProps) {
  const containerAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <Card className="relative group border-white/[0.05] hover:border-cyan-500/20 bg-black/30 backdrop-blur-xl transition-all duration-500">
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5 group-hover:opacity-50 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        {/* Header with glass effect */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl" />
            <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-3 rounded-xl backdrop-blur-sm border border-cyan-500/20">
              <Book className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Additional Analysis
          </h3>
        </motion.div>

        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Security Considerations */}
          <motion.div variants={itemAnimation} className="relative p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Shield className="w-4 h-4" />
              <h4 className="font-medium text-sm">Security Analysis</h4>
            </div>
            <p className="text-sm text-gray-300">
              {result.securityConsiderations}
            </p>
          </motion.div>

          {/* Overall Feedback */}
          <motion.div variants={itemAnimation} className="relative p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lightbulb className="w-4 h-4" />
              <h4 className="font-medium text-sm">Overall Feedback</h4>
            </div>
            <p className="text-sm text-gray-300">
              {result.overallFeedback}
            </p>
          </motion.div>

          {/* Learning Resources */}
          <motion.div variants={itemAnimation} className="relative p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Book className="w-4 h-4" />
              <h4 className="font-medium text-sm">Learning Resources</h4>
            </div>
            <ul className="space-y-2">
              {result.learningResources.map((resource, index) => (
                <motion.li
                  key={index}
                  variants={itemAnimation}
                  className="group/item"
                >
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="group-hover/item:underline">
                      {resource.split("://")[1]}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Real World Analysis */}
          <motion.div variants={itemAnimation} className="relative p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <CheckCircle className="w-4 h-4" />
              <h4 className="font-medium text-sm">Real World Analysis</h4>
            </div>
            
            {/* Applicable Problems */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400">Applicable Problems</h5>
              <ul className="space-y-2">
                {result.realWorldAnalysis.applicableProblems.map((problem, index) => (
                  <motion.li
                    key={index}
                    variants={itemAnimation}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    {problem}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Required Modifications */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400">Required Modifications</h5>
              <ul className="space-y-2">
                {result.realWorldAnalysis.requiredModifications.map((mod, index) => (
                  <motion.li
                    key={index}
                    variants={itemAnimation}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    {mod}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Target Industries */}
            <div className="flex flex-wrap gap-2">
              {result.realWorldAnalysis.targetIndustries.map((industry, index) => (
                <motion.div
                  key={index}
                  variants={itemAnimation}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm"
                >
                  <span className="text-sm text-cyan-400">{industry}</span>
                </motion.div>
              ))}
            </div>

            {/* Business Value */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400">Business Value</h5>
              <p className="text-sm text-gray-300">{result.realWorldAnalysis.businessValue}</p>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
