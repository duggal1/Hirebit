'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useResume } from '@/app/context/resumecontext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Sparkles, Eye, ArrowRight, Bot, Brain, CheckCircle, AlertCircle, Mail, MapPin } from 'lucide-react';
import { generateResumeContent } from "@/lib/gemini";
import { toast } from "sonner";
import { ResumeData } from "@/lib/resume-validator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { buildResume, generateResume } from '@/app/actions/resume';
import { getResume } from '@/app/actions/resume';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Section = keyof ResumeData;

interface Question {
  id: string;
  question: string;
  aiPrompt?: string;
  type?: 'boolean';
  validation?: (value: string) => boolean | string;
}

interface InterviewSection {
  id: Section;
  title: string;
  questions: Question[];
}

const INTERVIEW_SECTIONS: InterviewSection[] = [
  {
    id: 'personalInfo',
    title: 'Personal Information',
    questions: [
      {
        id: 'fullName',
        question: "What's your full name?",
        aiPrompt: "Format this name professionally, considering capitalization and spacing",
        validation: (value: string) => value.length >= 2 || "Name must be at least 2 characters long"
      },
      {
        id: 'email',
        question: "What's your professional email address?",
        aiPrompt: "Validate and format this email address professionally",
        validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Please enter a valid email address"
      },
      {
        id: 'location',
        question: "Where are you located? (City, Country)",
        aiPrompt: "Format this location in a standard 'City, Country' format",
        validation: (value: string) => value.includes(',') || "Please enter both city and country separated by a comma"
      },
      {
        id: 'portfolio',
        question: "Do you have a portfolio website? (Optional)",
        aiPrompt: "Validate and format this URL, suggest improvements if needed",
        validation: (value: string) => !value || /^https?:\/\//.test(value) || "Please enter a valid URL starting with http:// or https://"
      }
    ]
  },
  {
    id: 'workExperience',
    title: 'Work Experience',
    questions: [
      {
        id: 'position',
        question: "What was your job title?",
        aiPrompt: "Convert this job title to its most recognized industry-standard form and suggest improvements",
        validation: (value: string) => value.length >= 2 || "Job title must be at least 2 characters long"
      },
      {
        id: 'company',
        question: "Which company did you work for?",
        aiPrompt: "Format company name with proper capitalization and verify if it's a known company",
        validation: (value: string) => value.length >= 2 || "Company name must be at least 2 characters long"
      },
      {
        id: 'duration',
        question: "When did you work there? (MM/YYYY - MM/YYYY or Present)",
        aiPrompt: "Format this duration in a standard resume format and validate the date range",
        validation: (value: string) => /^\d{2}\/\d{4}\s*-\s*(\d{2}\/\d{4}|Present)$/.test(value) || "Please use the format MM/YYYY - MM/YYYY or MM/YYYY - Present"
      },
      {
        id: 'responsibilities',
        question: "What were your main responsibilities? (We'll help format these into achievements)",
        aiPrompt: "Transform these responsibilities into quantifiable achievements with metrics and action verbs",
        validation: (value: string) => value.length >= 20 || "Please provide more detail about your responsibilities"
      },
      {
        id: 'technologies',
        question: "What technologies and tools did you use?",
        aiPrompt: "Format and categorize these technologies, highlighting in-demand skills",
        validation: (value: string) => value.length >= 5 || "Please list at least a few technologies"
      },
      {
        id: 'addMore',
        question: "Would you like to add another work experience?",
        type: 'boolean'
      }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    questions: [
      {
        id: 'name',
        question: "What's the name of your project?",
        aiPrompt: "Format this project name professionally"
      },
      {
        id: 'description',
        question: "Describe your project and its impact",
        aiPrompt: "Transform this into a concise, impactful description focusing on technologies and results"
      },
      {
        id: 'technologies',
        question: "What technologies did you use?",
        aiPrompt: "Format and categorize these technologies"
      },
      {
        id: 'addMore',
        question: "Would you like to add another project?",
        type: 'boolean'
      }
    ]
  },
  {
    id: 'skills',
    title: 'Skills',
    questions: [
      {
        id: 'technical',
        question: "What are your technical skills?",
        aiPrompt: "Categorize and format these skills, suggesting additional relevant skills"
      },
      {
        id: 'soft',
        question: "What soft skills do you possess?",
        aiPrompt: "Format these soft skills professionally, suggesting improvements"
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    questions: [
      {
        id: 'degree',
        question: "What's your highest degree?",
        aiPrompt: "Format this degree in standard academic notation"
      },
      {
        id: 'institution',
        question: "Which institution did you attend?",
        aiPrompt: "Format institution name properly"
      },
      {
        id: 'year',
        question: "When did you graduate?",
        aiPrompt: "Format this date in standard resume format"
      },
      {
        id: 'addMore',
        question: "Would you like to add another education entry?",
        type: 'boolean'
      }
    ]
  }
];

// Add email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResumeInterview() {
  const { updateSection, resumeData, generateContent } = useResume();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [buildingStatus, setBuildingStatus] = useState<{
    step: string;
    progress: number;
    message: string;
  } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Add validation state
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});

  const currentSectionData = INTERVIEW_SECTIONS[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];

  // AI-powered suggestions
  const generateSuggestions = async (value: string) => {
    if (!value || value.length < 3) return;
    
    try {
      const suggestions = await generateContent(
        currentSectionData.id,
        `${currentQuestionData.aiPrompt}: ${value}`
      );
      
      if (typeof suggestions === 'string') {
        toast.success("AI Suggestions Available", {
          action: {
            label: "Use Suggestion",
            onClick: () => setAnswer(suggestions)
          }
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  // Debounced AI suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (answer && !currentQuestionData.type) {
        generateSuggestions(answer);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [answer]);

  const validateAnswer = () => {
    if (currentQuestionData.type === 'boolean') return true;
    if (!currentQuestionData.validation) return true;
    
    const validationResult = currentQuestionData.validation(answer);
    if (typeof validationResult === 'string') {
      setValidationError(validationResult);
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  // Real-time personal info validation
  useEffect(() => {
    const validatePersonalInfo = () => {
      if (!sectionData.personalInfo) return false;
      const { fullName, email } = sectionData.personalInfo;
      
      const isFullNameValid = fullName?.trim()?.length > 0;
      const isEmailValid = email?.trim()?.length > 0 && EMAIL_REGEX.test(email);
      
      setIsValid({
        fullName: isFullNameValid,
        email: isEmailValid
      });

      return isFullNameValid && isEmailValid;
    };

    if (currentSection === 0) {
      validatePersonalInfo();
    }
  }, [sectionData.personalInfo, currentSection]);

  // Enhanced loadResume function
  const loadResume = useCallback(async () => {
    try {
      const data = await getResume();
      if (data) {
        // Initialize all sections with existing data
        const initialData = {
          personalInfo: data.personalInfo ? {
            fullName: data.personalInfo.fullName || '',
            email: data.personalInfo.email || '',
            location: data.personalInfo.location || '',
            portfolio: data.personalInfo.portfolio || '',
            github: data.personalInfo.github || '',
            linkedin: data.personalInfo.linkedin || ''
          } : {},
          workExperience: data.workExperience || [],
          projects: data.projects || [],
          education: data.education || [],
          skills: data.skills || []
        };
        
        setSectionData(initialData);
        return data;
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume data');
    }
  }, []);

  // Enhanced handleNext function
  const handleNext = async () => {
    if (!validateAnswer()) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);
    try {
      // Process answer with AI
      let processedAnswer = answer;
      if (currentQuestionData.aiPrompt) {
        try {
          const aiResponse = await generateContent(
            currentSectionData.id,
            `${currentQuestionData.aiPrompt}: ${answer}`
          );
          processedAnswer = aiResponse ?? answer;
        } catch (error) {
          console.error('AI processing failed, using original answer');
        }
      }

      // Update section data with proper nesting
      setSectionData(prev => ({
        ...prev,
        [currentSectionData.id]: {
          ...prev[currentSectionData.id],
          [currentQuestionData.id]: processedAnswer
        }
      }));

      // Handle section completion
      if (currentQuestion < currentSectionData.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Save section data before moving to next section
        await updateSection(currentSectionData.id, sectionData[currentSectionData.id]);
        
        if (currentSection < INTERVIEW_SECTIONS.length - 1) {
          setCurrentSection(prev => prev + 1);
          setCurrentQuestion(0);
        } else {
          await handleFinalSubmission();
        }
      }
      setAnswer('');
    } catch (error) {
      toast.error('Failed to process answer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced handleFinalSubmission function
  const handleFinalSubmission = async () => {
    try {
      // Combine section data with existing resume data
      const completeData = {
        ...resumeData,
        ...sectionData
      };

      // Validate required personal info fields
      if (!completeData.personalInfo?.fullName?.trim() || 
          !completeData.personalInfo?.email?.trim()) {
        toast.error('Please complete the personal information section first');
        setCurrentSection(0);
        setCurrentQuestion(0);
        return;
      }

      // Validate email format
      if (!EMAIL_REGEX.test(completeData.personalInfo.email)) {
        toast.error('Please enter a valid email address');
        setCurrentSection(0);
        setCurrentQuestion(1); // Jump to email question
        return;
      }

      // Force save all accumulated data
      const saveOperations = Object.entries(completeData).map(([section, data]) => 
        updateSection(section as keyof ResumeData, data)
      );

      await Promise.all(saveOperations);
      
      // Refresh data after save
      const currentResume = await loadResume();
      if (!currentResume?.id) {
        throw new Error('Failed to load resume after save');
      }

      // Start building process
      setBuildingStatus({
        step: 'validation',
        progress: 0,
        message: 'Starting resume building process...'
      });

      // Build resume with all sections
      const buildResult = await buildResume(currentResume.id);
      
      if (!buildResult.success || !buildResult.data) {
        throw new Error(buildResult.error || 'Failed to build resume');
      }

      setBuildingStatus({
        step: 'ai_enhancement',
        progress: 25,
        message: 'AI is enhancing your resume...'
      });

      // Generate final resume
      const generateResult = await generateResume(buildResult.data.id);
      
      if (!generateResult.success || !generateResult.data?.downloadUrl) {
        throw new Error(generateResult.error || 'Failed to generate resume');
      }

      // Update progress through steps
      const steps = [
        { name: 'validation', message: 'Validating all sections...', progress: 50 },
        { name: 'ai_enhancement', message: 'Applying AI enhancements...', progress: 75 },
        { name: 'formatting', message: 'Formatting resume...', progress: 90 },
        { name: 'final_polish', message: 'Final polishing...', progress: 100 }
      ];

      for (const step of steps) {
        setBuildingStatus({
          step: step.name,
          progress: step.progress,
          message: step.message
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setDownloadUrl(generateResult.data.downloadUrl);
      await loadResume();
      setShowPreview(true);

      toast.success("Your resume has been created and enhanced by AI!", {
        action: {
          label: "View Preview",
          onClick: () => setShowPreview(true)
        }
      });
      setBuildingStatus(null);
    } catch (error) {
      console.error('Error in final submission:', error);
      toast.error(error instanceof Error ? error.message : "Failed to build resume");
      setBuildingStatus(null);
    }
  };

  // Add validation indicator to input fields
  const renderInput = () => {
    const isPersonalInfoField = currentSectionData.id === 'personalInfo';
    const fieldName = currentQuestionData.id;
    const showValidation = isPersonalInfoField && isValid[fieldName] !== undefined;

    return (
      <div className="space-y-2">
        {currentQuestionData.id === 'highlights' ? (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your response..."
            className={cn("h-32", {
              "border-green-500": showValidation && isValid[fieldName],
              "border-red-500": showValidation && !isValid[fieldName]
            })}
          />
        ) : (
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your response..."
            className={cn({
              "border-green-500": showValidation && isValid[fieldName],
              "border-red-500": showValidation && !isValid[fieldName]
            })}
          />
        )}
        {validationError && (
          <p className="text-red-500 text-sm">{validationError}</p>
        )}
      </div>
    );
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setCurrentQuestion(INTERVIEW_SECTIONS[currentSection - 1].questions.length - 1);
    }
  };

  if (buildingStatus) {
    return (
      <Card className="space-y-6 p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
            <h2 className="font-semibold text-xl">{buildingStatus.message}</h2>
          </div>
          <Progress value={buildingStatus.progress} className="h-2" />
          <p className="text-gray-400 text-sm">
            Step: {buildingStatus.step.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      </Card>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-xl">Resume Completed!</h2>
            </div>
            <div className="flex gap-2">
              {downloadUrl && (
                <Button 
                  variant="default" 
                  onClick={() => window.open(downloadUrl, '_blank')}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Download PDF
                </Button>
              )}
              <Button onClick={() => setShowPreview(false)}>
                Continue Editing
              </Button>
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-8">
                {/* Personal Info */}
                {resumeData.personalInfo && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h1 className="font-bold text-2xl">{resumeData.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap gap-4 text-gray-400">
                      {resumeData.personalInfo.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{resumeData.personalInfo.email}</span>
                        </div>
                      )}
                      {resumeData.personalInfo.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{resumeData.personalInfo.location}</span>
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}

                {/* Work Experience */}
                {resumeData.workExperience && resumeData.workExperience.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="font-semibold text-xl">Work Experience</h2>
                    <div className="space-y-6">
                      {resumeData.workExperience.map((exp, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium">{exp.position}</h3>
                          <p className="text-gray-400">{exp.company}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(exp.startDate).toLocaleDateString()} - 
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                          </p>
                          <ul className="space-y-1 pl-5 list-disc">
                            {exp.highlights.map((highlight, i) => (
                              <li key={i} className="text-gray-400">{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Projects */}
                {resumeData.projects && resumeData.projects.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="font-semibold text-xl">Projects</h2>
                    <div className="space-y-6">
                      {resumeData.projects.map((project, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-gray-400">{project.description}</p>
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Project
                            </a>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, i) => (
                              <Badge key={i} variant="secondary">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="font-semibold text-xl">Education</h2>
                    <div className="space-y-4">
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="space-y-1">
                          <h3 className="font-medium">{edu.degree}</h3>
                          <p className="text-gray-400">{edu.institution}</p>
                          <p className="text-gray-500 text-sm">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Skills */}
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="font-semibold text-xl">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-medium text-lg">{currentSectionData.title}</h2>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {currentSectionData.questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {resumeData.personalInfo && (
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 text-sm">AI-Powered Interview</span>
          </div>
        </div>
      </div>

      {/* Split view when preview is enabled */}
      <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
        {/* Interview questions */}
        <div className="space-y-8">
          {/* Question */}
          <Card className="p-6">
            <motion.div
              key={`${currentSection}-${currentQuestion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="font-medium text-lg">
                {currentQuestionData.question}
              </h3>
              {currentQuestionData.type === 'boolean' ? (
                <div className="flex gap-4">
                  <Button
                    variant={answer === 'yes' ? 'default' : 'outline'}
                    onClick={() => setAnswer('yes')}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={answer === 'no' ? 'default' : 'outline'}
                    onClick={() => setAnswer('no')}
                  >
                    No
                  </Button>
                </div>
              ) : renderInput()}
            </motion.div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentSection === 0 && currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answer || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="lg:block">
            <Card className="p-6">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-8">
                  {/* Personal Info */}
                  {resumeData.personalInfo && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h1 className="font-bold text-2xl">{resumeData.personalInfo.fullName}</h1>
                      <div className="flex flex-wrap gap-4 text-gray-400">
                        {resumeData.personalInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{resumeData.personalInfo.email}</span>
                          </div>
                        )}
                        {resumeData.personalInfo.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{resumeData.personalInfo.location}</span>
                          </div>
                        )}
                      </div>
                    </motion.section>
                  )}

                  {/* Work Experience */}
                  {resumeData.workExperience && resumeData.workExperience.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="font-semibold text-xl">Work Experience</h2>
                      <div className="space-y-6">
                        {resumeData.workExperience.map((exp, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className="font-medium">{exp.position}</h3>
                            <p className="text-gray-400">{exp.company}</p>
                            <p className="text-gray-500 text-sm">
                              {new Date(exp.startDate).toLocaleDateString()} - 
                              {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            <ul className="space-y-1 pl-5 list-disc">
                              {exp.highlights.map((highlight, i) => (
                                <li key={i} className="text-gray-400">{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* Projects */}
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="font-semibold text-xl">Projects</h2>
                      <div className="space-y-6">
                        {resumeData.projects.map((project, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-gray-400">{project.description}</p>
                            {project.url && (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Project
                              </a>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, i) => (
                                <Badge key={i} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* Education */}
                  {resumeData.education && resumeData.education.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="font-semibold text-xl">Education</h2>
                      <div className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="space-y-1">
                            <h3 className="font-medium">{edu.degree}</h3>
                            <p className="text-gray-400">{edu.institution}</p>
                            <p className="text-gray-500 text-sm">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* Skills */}
                  {resumeData.skills && resumeData.skills.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="font-semibold text-xl">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </motion.section>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 