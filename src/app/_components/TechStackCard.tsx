import { Card, CardContent } from "@/components/ui/card";
import { EvaluationResult } from "@/src/types/code";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Database, SparkleIcon, Code, Cpu, GitBranch, CheckCircle } from "lucide-react";

interface TechStackCardProps {
  result: EvaluationResult;
}

export default function TechStackCard({ result }: TechStackCardProps) {
  const { techStack } = result;

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

  const getTechIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "frontend":
        return <Layers className="w-4 h-4" />;
      case "backend":
        return <Cpu className="w-4 h-4" />;
      case "databases":
        return <Database className="w-4 h-4" />;
      case "tools":
        return <SparkleIcon className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const techCategories = [
    { name: "Frontend", data: techStack.frontend },
    { name: "Backend", data: techStack.backend },
    { name: "Databases", data: techStack.databases },
    { name: "Tools", data: techStack.tools }
  ];

  return (
    <Card className="relative border-white/[0.05] hover:border-cyan-500/20 bg-black/30 backdrop-blur-xl transition-all duration-500 group">
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/5 group-hover:opacity-50 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        {/* Header with glass effect */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl" />
            <div className="relative border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-3 border rounded-xl">
              <GitBranch className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <h3 className="bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-semibold text-transparent text-xl">
            Tech Stack
          </h3>
        </motion.div>

        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Application Type with floating effect */}
          <motion.div 
            variants={itemAnimation} 
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm px-4 py-2 border rounded-full"
            >
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-purple-400 text-sm">{techStack.applicationType}</span>
            </motion.div>
          </motion.div>

          {/* Tech Categories Grid with glass cards */}
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
            {techCategories.map((category, index) => (
              <motion.div
                key={category.name}
                variants={itemAnimation}
                whileHover={{ scale: 1.02 }}
                className="relative group/card"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover/card:opacity-100 rounded-xl transition-opacity duration-300" />
                <div className="relative space-y-3 border-purple-500/10 bg-purple-500/5 backdrop-blur-sm p-4 border rounded-xl">
                  <div className="flex items-center gap-2 text-purple-400">
                    {getTechIcon(category.name)}
                    <h4 className="font-medium text-sm">{category.name}</h4>
                  </div>
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {category.data.map((tech, techIndex) => (
                        <motion.li
                          key={techIndex}
                          variants={itemAnimation}
                          className="flex items-center gap-2 text-gray-300 text-sm group/item"
                          whileHover={{ x: 5 }}
                        >
                          <span className="group-hover/item:scale-110 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-1.5 h-1.5 transition-transform duration-300" />
                          {tech}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Code Highlights with animated border */}
          <motion.div 
            variants={itemAnimation} 
            className="relative space-y-3 border-purple-500/10 bg-purple-500/5 backdrop-blur-sm p-4 border rounded-xl"
          >
            <h4 className="flex items-center gap-2 font-medium text-purple-400 text-sm">
              <Code className="w-4 h-4" />
              Code Highlights
            </h4>
            <ul className="space-y-2">
              {techStack.codeHighlights.map((highlight, index) => (
                <motion.li
                  key={index}
                  variants={itemAnimation}
                  className="flex items-start gap-2 text-gray-300 text-sm group/item"
                  whileHover={{ x: 5 }}
                >
                  <span className="group-hover/item:scale-110 bg-gradient-to-r from-purple-400 to-pink-500 mt-1.5 rounded-full w-1.5 h-1.5 transition-transform duration-300" />
                  {highlight}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Language Distribution with floating badges */}
          <motion.div 
            variants={itemAnimation} 
            className="space-y-3"
          >
            <h4 className="flex items-center gap-2 font-medium text-purple-400 text-sm">
              <Cpu className="w-4 h-4" />
              Language Distribution
            </h4>
            <div className="flex flex-wrap gap-2">
              {techStack.languageUsage.map((lang, index) => (
                <motion.div
                  key={index}
                  variants={itemAnimation}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm px-3 py-1.5 border rounded-full"
                >
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-1.5 h-1.5" />
                  <span className="text-purple-400 text-sm">{lang}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
