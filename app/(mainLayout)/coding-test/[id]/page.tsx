"use client";
import { notFound, useParams } from "next/navigation";
import { CheatGuard } from "@/components/test/CheatGuard";
import { Editor } from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";
import { getJobForTest, submitTestResults } from "@/app/actions/coding-test";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, RocketIcon } from "@/components/icons";
import { CheckCircleIcon, AlertTriangleIcon, Code2Icon, BookOpenIcon, BrainCircuitIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestData {
  problem_statement: string;
  duration: number;
  requirements: {
    functional: string[];
    technical: string[];
    constraints: string[];
  };
  starter_code: string;
  test_cases: TestCase[];
  evaluation_criteria: {
    code_quality: number;
    performance: number;
    architecture: number;
    testing: number;
    documentation: number;
  };
  questions: {
    title: string;
    description: string;
    difficulty: string;
    category: string;
    hints: string[];
    solution_approach: string;
    time_complexity: string;
    space_complexity: string;
  }[];
}

interface TestCase {
  input: string;
  expected_output: string;
  explanation: string;
}

interface CodeEvaluation {
  score: number;
  feedback: string;
  correctness: boolean;
  efficiency: string;
  quality: string;
  realTimeSuggestions: string[];
  jobFitAnalysis: {
    strengthsForRole: string[];
    areasToImprove: string[];
    overallJobFit: string;
  };
  scalabilityScore: number;
  faultToleranceScore: number;
}

export default function CodingTestPage() {
  const params = useParams();
  const testId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [code, setCode] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState<CodeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobData = await getJobForTest(testId);
        if (!jobData?.test) return notFound();
        setJob(jobData);
        setTestData(jobData.test);
        setTimeLeft((jobData.test.duration || 90) * 60);
        setCode(jobData.test.starter_code || '');
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : "Failed to load test");
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  useEffect(() => {
    if (!timeLeft || completed) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, completed]);

  const handleSubmit = async () => {
    if (!testData) return;
    try {
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          requirements: testData.requirements,
          evaluation_criteria: testData.evaluation_criteria
        })
      });

      const result = await response.json();
      await submitTestResults({
        jobId: testId,
        code,
        results: [result],
        status: result.score >= 70 ? "ACCEPTED" : "REJECTED",
        score: result.score
      });
      setCompleted(true);
      toast.success("Test submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit test");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-4 text-center"
      >
        <BrainCircuitIcon className="mx-auto w-12 h-12 text-primary animate-pulse" />
        <h2 className="font-bold text-2xl">Analyzing Job Requirements...</h2>
        <p className="text-muted-foreground">Preparing your coding challenge</p>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 max-w-md">
        <AlertTriangleIcon className="mx-auto mb-4 w-12 h-12 text-destructive" />
        <h2 className="mb-2 font-bold text-2xl text-center">Error Loading Test</h2>
        <p className="text-center text-muted-foreground">{error}</p>
      </Card>
    </div>
  );

  if (!testData) return notFound();

  return (
    <div className="bg-gradient-to-br from-background via-background/95 to-muted/30 min-h-screen">
      <div className="space-y-8 mx-auto p-4 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex md:flex-row flex-col justify-between items-start gap-6 pt-4"
        >
          <div className="space-y-3">
            <h1 className="font-bold text-4xl">
              <span className="bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary-foreground text-transparent">
                {job?.jobTitle}
              </span>
              <span className="ml-2 text-2xl text-muted-foreground">Challenge</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              {job?.test?.technical_requirements?.must_have_skills?.map((skill: string) => (
                <Badge 
                  key={skill} 
                  variant="secondary"
                  className="bg-secondary/80 hover:bg-secondary/90 px-3 py-1 font-medium text-sm transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 bg-card/50 shadow-lg backdrop-blur-sm p-4 border border-border/50 rounded-xl">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-primary" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <Progress 
              value={(timeLeft / (testData.duration * 60)) * 100} 
              className="bg-muted/50 w-32 h-2"
            />
          </div>
        </motion.div>

        <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 h-[calc(100vh-12rem)]"
          >
            <Card className="bg-card/50 shadow-xl backdrop-blur-sm border-border/50 h-full overflow-hidden">
              <div className="h-full">
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20 },
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: true
                  }}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto scrollbar-thin scrollbar-track-muted/50"
          >
            <Card className="bg-card/50 shadow-lg backdrop-blur-sm p-6 border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <BookOpenIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-xl">Problem Statement</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {testData.problem_statement}
              </p>
            </Card>

            {testData.questions?.map((question, index) => (
              <Card 
                key={index} 
                className="bg-card/50 shadow-lg hover:shadow-xl backdrop-blur-sm p-6 border-border/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{question.title}</h3>
                  <Badge variant={
                    question.difficulty === 'Hard' ? 'destructive' :
                    question.difficulty === 'Medium' ? 'secondary' : 'default'
                  }>
                    {question.difficulty}
                  </Badge>
                </div>
                <p className="mb-4 text-muted-foreground">{question.description}</p>
                
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="mb-2 font-medium">Approach</h4>
                    <p className="text-muted-foreground text-sm">{question.solution_approach}</p>
                    <div className="flex gap-4 mt-3 text-muted-foreground text-xs">
                      <span>Time: {question.time_complexity}</span>
                      <span>Space: {question.space_complexity}</span>
                    </div>
                  </div>

                  {question.hints.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Hints</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        {question.hints.map((hint, i) => (
                          <li key={i} className="text-muted-foreground text-sm">{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {!completed && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SubmitButton
                  onClick={handleSubmit}
                  className="gap-3 bg-primary/90 hover:bg-primary shadow-lg py-6 w-full font-medium text-lg transition-colors"
                >
                  <RocketIcon className="w-5 h-5" />
                  Submit Solution
                </SubmitButton>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <CheatGuard onViolation={async () => {
        toast.error("Test terminated due to violation");
        await submitTestResults({
          jobId: testId,
          code: "",
          results: [],
          status: "REJECTED",
          score: 0
        });
        window.location.href = "/";
      }} />
    </div>
  );
}
