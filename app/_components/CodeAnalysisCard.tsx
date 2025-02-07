import { Card, CardContent } from "@/components/ui/card";
import { EvaluationResult } from "@/types/code";
import { motion } from "framer-motion";
import { Code2, CheckCircle2, XCircle, BookOpen, Shield, Lightbulb } from "lucide-react";

interface CodeAnalysisCardProps {
  result: EvaluationResult;
}

export function CodeAnalysisCard({ result }: CodeAnalysisCardProps) {
  const { codeAnalysis, learningResources } = result;

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
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5 group-hover:opacity-50 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-3 rounded-xl">
            <Code2 className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Code Analysis
          </h3>
        </div>

        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Strengths Section */}
          <motion.div variants={itemAnimation} className="space-y-3">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <h4 className="font-medium">Strengths</h4>
            </div>
            <ul className="space-y-2">
              {codeAnalysis.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  variants={itemAnimation}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                  {strength}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses Section */}
          <motion.div variants={itemAnimation} className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <XCircle className="w-4 h-4" />
              <h4 className="font-medium">Areas for Improvement</h4>
            </div>
            <ul className="space-y-2">
              {codeAnalysis.weaknesses.map((weakness, index) => (
                <motion.li
                  key={index}
                  variants={itemAnimation}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-pink-500" />
                  {weakness}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Best Practices Section */}
          <motion.div variants={itemAnimation} className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Shield className="w-4 h-4" />
              <h4 className="font-medium">Best Practices</h4>
            </div>
            <ul className="space-y-2">
              {codeAnalysis.bestPractices.map((practice, index) => (
                <motion.li
                  key={index}
                  variants={itemAnimation}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500" />
                  {practice}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Learning Resources */}
          <motion.div variants={itemAnimation} className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <h4 className="font-medium">Learning Resources</h4>
            </div>
            <ul className="space-y-3">
              {learningResources.map((resource, index) => (
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
                    <Lightbulb className="w-4 h-4" />
                    <span className="group-hover/item:underline">
                      {resource.split("://")[1]}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}