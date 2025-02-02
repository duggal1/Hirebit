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

interface TestQuestion {
  question: string;
  starterCode: string;
  testCases: { input: string; output: string }[];
  difficulty: string;
  skillsTested: string[];
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobPost = await getJobForTest(testId);
        
        if (!jobPost) return notFound();
        
        const response = await fetch('/api/generate-test', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ jobDescription: jobPost.jobDescription })
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate test');
        }
        
        const test = await response.json();
        
        const validatedTest: TestData = {
          questions: test.questions || [],
          duration: test.duration || 90,
          skillsTested: Array.isArray(test.skillsTested) ? test.skillsTested : [],
          evaluationCriteria: test.evaluationCriteria || []
        };
        
        setJob(jobPost);
        setTestData(validatedTest);
        setTimeLeft(validatedTest.duration * 60);
        setCode(validatedTest.questions[0]?.starterCode || '');
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
          question: testData.questions[currentQuestion].question
        })
      });

      const result = await response.json();
      const newResults = [...results, result];
      setResults(newResults);

      const nextQuestion = testData.questions[currentQuestion + 1];
      if (nextQuestion) {
        setCurrentQuestion(prev => prev + 1);
        setCode(nextQuestion.starterCode);
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
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="question">Problem</TabsTrigger>
            <TabsTrigger value="submissions">Your Submissions</TabsTrigger>
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
                  setCode(testData.questions[currentQuestion - 1].starterCode);
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
