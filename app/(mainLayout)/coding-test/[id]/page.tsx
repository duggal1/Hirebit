"use client";
import { notFound, useParams } from "next/navigation";
import { CheatGuard } from "@/components/test/CheatGuard";
import { QuestionCard } from "@/components/test/QuestionCard";
import { Editor } from "@monaco-editor/react";
import { useState, useEffect, useCallback, Key } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { getJobForTest, submitTestResults } from "@/app/actions/coding-test";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, RocketIcon } from "@/components/icons";
import { ArrowRightIcon } from "lucide-react";
import { CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

interface TestQuestion {
  question: string;
  technicalRequirements: string[];
  performanceThresholds: {
    maxCpu: string;
    maxMemory: string;
    throughput: string;
  };
  debuggingSection: {
    preWrittenCode: string;
    knownIssues: number;
    failureScenarios: string[];
  };
  submissionArtifacts: string[];
}

interface QuestionCardProps {
  question: TestQuestion;
  index: number;
  isCurrent: boolean;
}

interface BadgeVariant {
  variant?: "default" | "destructive" | "outline" | "secondary" | "success";
}

interface TestData {
  questions: TestQuestion[];
  duration: number;
  skillsTested: string[];
  evaluationCriteria: string[];
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

interface EvaluationResult {
  scores: {
    code_quality: number;
    performance: number;
    architecture: number;
    testing: number;
    documentation: number;
  };
  analysis: {
    technical_skills: string[];
    missing_requirements: string[];
    architecture_validation: string[];
  };
}

export default function CodingTestPage() {
  const params = useParams();
  const testId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState<CodeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobData = await getJobForTest(testId);
        
        if (!jobData) return notFound();
        
        setJob(jobData);
        setTestData(jobData.test);
        setTimeLeft(jobData.test.duration * 60);
        setCode(jobData.test.questions[0]?.debuggingSection?.preWrittenCode || '');
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : "Failed to load test");
        setLoading(false);
      }
    };

    fetchData();
  }, [testId]);

  const handleViolation = useCallback(async (count: number) => {
    toast.error("Test terminated due to multiple violations");
    await submitTestResults({
      jobId: testId,
      code: "",
      results: [],
      status: "REJECTED",
      score: 0
    });
    window.location.href = "/";
  }, [testId]);

  const handleSubmit = async () => {
    if (!testData?.questions?.[currentQuestion]) return;

    try {
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          requirements: job.test.requirements,
          evaluation_matrix: job.test.evaluation_matrix
        })
      });

      const result = await response.json();
      const newResults = [...results, result];
      setResults(newResults);

      const nextQuestion = testData.questions[currentQuestion + 1];
      if (nextQuestion) {
        setCurrentQuestion(prev => prev + 1);
        setCode(nextQuestion.debuggingSection.preWrittenCode);
      } else {
        const totalScore = newResults.reduce((acc, curr) => acc + curr.score, 0) / newResults.length;
        await submitTestResults({
          jobId: testId,
          code,
          results: newResults,
          status: totalScore >= 70 ? "ACCEPTED" : "REJECTED",
          score: totalScore
        });
        setCompleted(true);
      }
    } catch (error) {
      toast.error("Failed to submit answer");
    }
  };

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
  }, [timeLeft, completed, handleSubmit]);

  useEffect(() => {
    if (!code || !testData?.questions[currentQuestion]) return;

    const timer = setTimeout(async () => {
      try {
        setIsEvaluating(true);
        const response = await fetch("/api/evaluate-code", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            requirements: job.test.requirements,
            evaluation_matrix: job.test.evaluation_matrix
          })
        });

        if (response.ok) {
          const evaluation = await response.json();
          setRealTimeFeedback(evaluation);
        }
      } catch (error) {
        console.error('Real-time evaluation error:', error);
      } finally {
        setIsEvaluating(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, currentQuestion, testData, job]);

  if (loading) return <div className="p-8 text-center">Generating test...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!testData) return notFound();

  return (
    <div className="space-y-6 py-8 max-w-7xl container">
      <div className="flex md:flex-row flex-col justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 font-bold text-3xl text-transparent">
            {job?.jobTitle} Coding Challenge
          </h1>
          <p className="text-muted-foreground">
            Testing skills: {Array.isArray(testData?.skillsTested) ? testData.skillsTested.join(", ") : "Loading skills..."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg font-mono">
            <ClockIcon className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <Progress 
            value={(currentQuestion + 1) / testData.questions.length * 100}
            className="w-32 h-2"
          />
          <span className="text-muted-foreground">
            Q{currentQuestion + 1}/{testData.questions.length}
          </span>
        </div>
      </div>

      <Tabs defaultValue="question" className="gap-8 grid md:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="question">Problem</TabsTrigger>
            <TabsTrigger value="feedback">Real-time Feedback</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="question" className="space-y-6">
            {testData.questions.map((q: TestQuestion, i: Key) => (
              <QuestionCard
                key={i}
                question={q}
                index={i as number}
                isCurrent={i === currentQuestion}
              />
            ))}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            {isEvaluating ? (
              <div className="space-y-4 animate-pulse">
                <div className="bg-muted rounded w-3/4 h-4"></div>
                <div className="bg-muted rounded w-1/2 h-4"></div>
              </div>
            ) : realTimeFeedback ? (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="mb-2 font-medium">Real-time Suggestions</h3>
                  <ul className="space-y-2">
                    {realTimeFeedback.realTimeSuggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <span className="text-primary">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="mb-2 font-medium">Architecture Review</h3>
                  <div className="gap-4 grid grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-500 text-sm">Strengths</h4>
                      {realTimeFeedback.jobFitAnalysis.strengthsForRole.map((strength, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircleIcon className="mt-1 w-4 h-4 text-green-500" />
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-yellow-500">Improvements</h4>
                      {realTimeFeedback.jobFitAnalysis.areasToImprove.map((area, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangleIcon className="mt-1 w-4 h-4 text-yellow-500" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {job?.test?.expertise?.level === 'senior' && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="mb-2 font-medium text-sm">System Design Evaluation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Scalability</span>
                          <Badge variant={realTimeFeedback.scalabilityScore >= 4 ? 'secondary' : 'destructive'}>
                            {realTimeFeedback.scalabilityScore}/5
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Fault Tolerance</span>
                          <Badge variant={realTimeFeedback.faultToleranceScore >= 4 ? 'secondary' : 'destructive'}>
                            {realTimeFeedback.faultToleranceScore}/5
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Start coding to see real-time feedback
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions">
            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={i} className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Question {i + 1}</span>
                    <Badge 
                      variant={result.score >= 70 ? "secondary" : "destructive"}
                      className={result.score >= 70 ? "bg-green-500/10 text-green-500" : ""}
                    >
                      {result.score}%
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {result.feedback.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>

        <div className="top-4 sticky h-[calc(100vh-200px)]">
          <div className="bg-[1e1e1e] border rounded-lg h-full overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {!completed && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="ghost"
                disabled={currentQuestion === 0}
                onClick={() => {
                  if (!testData?.questions?.[currentQuestion - 1]) return;
                  setCurrentQuestion(prev => prev - 1);
                  setCode(testData.questions[currentQuestion - 1].debuggingSection.preWrittenCode);
                }}
              >
                ← Previous
              </Button>
              
              <SubmitButton
                onClick={handleSubmit}
                className="gap-2"
              >
                {currentQuestion === testData?.questions.length - 1 ? (
                  <>
                    <RocketIcon className="w-4 h-4" />
                    Final Submit
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </SubmitButton>
            </div>
          )}
        </div>
      </Tabs>

      <CheatGuard onViolation={handleViolation} />
    </div>
  );
}
