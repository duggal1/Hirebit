'use client';

import { PersonalInfoForm } from '@/components/forms/personal-info';
import { WorkExperienceForm } from '@/components/forms/work-experience';
import { ProjectsForm } from '@/components/forms/projects';
import { SkillsForm } from '@/components/forms/skills';
import { EducationForm } from '@/components/forms/education';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResume } from '@/app/context/resumecontext';
import { cn } from '@/lib/utils';
import { ResumePreview } from '@/components/forms/resume-builder/page';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { ResumeInterview } from '@/app/components/resume-interview';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Wand2, FileText, PenTool, Download, Sparkles, Bot, Brain, ArrowRight } from 'lucide-react';

const MotionCard = motion(Card);

export default function ResumeBuilder() {
  const { resumeData, generateContent } = useResume();
  const [showInterview, setShowInterview] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 5;
    
    if (resumeData.personalInfo) completed++;
    if (resumeData.workExperience?.length) completed++;
    if (resumeData.projects?.length) completed++;
    if (resumeData.education?.length) completed++;
    if (resumeData.skills?.length) completed++;
    
    return (completed / total) * 100;
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black min-h-screen text-gray-100">
      <div className="mx-auto p-8 container">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 mb-12"
        >
          <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-sm p-2 rounded-xl"
                >
                  <Brain className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h1 className="font-bold text-4xl">
                  <span className="bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-transparent">
                    AI Resume Builder
                  </span>
                </h1>
              </div>
              <p className="max-w-lg text-gray-400 text-lg">
                Create a professional resume in minutes with our AI assistant. 
                Let AI craft the perfect content while you focus on what matters.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowInterview(!showInterview)}
                variant={showInterview ? "secondary" : "outline"}
                className="group relative overflow-hidden"
              >
                {showInterview ? (
                  <>
                    <PenTool className="mr-2 w-4 h-4" />
                    Manual Edit
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 w-4 h-4" />
                    AI Interview
                  </>
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-emerald-500/10 hover:from-emerald-500/20 to-blue-500/10 hover:to-blue-500/20"
              >
                <Download className="mr-2 w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <MotionCard 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-gray-800/50 bg-gray-900/50 backdrop-blur-sm"
          >
            <CardContent className="py-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Resume Progress</h3>
                    <p className="text-gray-400 text-sm">Complete all sections for best results</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 font-semibold text-lg text-transparent">
                    {Math.round(calculateCompletion())}% Complete
                  </span>
                </div>
              </div>
              <Progress 
                value={calculateCompletion()} 
                className="bg-gray-800 h-2"
              />
              <div className="gap-4 grid grid-cols-2 md:grid-cols-5 mt-6">
                {['Personal', 'Experience', 'Projects', 'Education', 'Skills'].map((section, index) => (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm text-center transition-all duration-300",
                        "border border-gray-800/50 backdrop-blur-sm",
                        resumeData[section.toLowerCase() as keyof typeof resumeData]
                          ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/50"
                      )}
                    >
                      {section}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {showInterview ? (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <ResumeInterview />
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
              {/* Left Panel - Forms */}
              <motion.div 
                key="forms"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card className="border-gray-800/50 bg-gray-900/50 shadow-xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 font-bold text-2xl text-transparent">
                      <Wand2 className="w-6 h-6" />
                      Build Your Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid grid-cols-3 bg-gray-800/50 backdrop-blur-sm p-1 rounded-lg w-full">
                        {['Personal', 'Experience', 'Projects'].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase()}
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 rounded-md data-[state=active]:text-white transition-all"
                          >
                            {tab}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <ScrollArea className="p-4 h-[600px]">
                        <TabsContent value="personal">
                          <PersonalInfoForm />
                        </TabsContent>
                        
                        <TabsContent value="experience">
                          <WorkExperienceForm />
                        </TabsContent>

                        <TabsContent value="projects">
                          <ProjectsForm />
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>

                    <div className="gap-4 grid grid-cols-2 mt-6">
                      <SkillsForm />
                      <EducationForm />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Panel - Preview */}
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "sticky top-6 h-[calc(100vh-3rem)]",
                  "bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50",
                  "shadow-2xl shadow-emerald-500/5"
                )}
              >
                <ResumePreview />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}