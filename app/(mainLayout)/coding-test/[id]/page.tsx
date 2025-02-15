"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from "@monaco-editor/react";
import {
  ArrowRight,
  Brain,
  Info,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Lightbulb,
} from "lucide-react";
import { evaluateCode } from "@/services/gemini";
import { toast } from "@/app/_components/ui/use-toast";
import Timer from "@/app/_components/Timer";
import CodeQualityMetricsCard from "@/app/_components/CodeQualityMetricsCard";
import { CodeProblem, EvaluationResult } from "@/types/code";

export default function CodingTest() {
  const params = useParams();
  const router = useRouter();
  const jobSeekerId = params.id as string;
  const [questions, setQuestions] = useState<CodeProblem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex] || null;
  const [code, setCode] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("problem");
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  // Reset the hint when the current question changes
  useEffect(() => {
    setHint(null);
  }, [currentQuestionIndex]);

  // Fetch the hint when the user switches to the "hint" tab
  useEffect(() => {
    if (activeTab === "hint" && currentQuestion && !hint) {
      fetchHint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentQuestion]);

  async function fetchHint() {
    try {
      const response = await fetch(
        `/api/coding-test/hint/${jobSeekerId}?questionId=${currentQuestion?.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch hint");
      }
      const data = await response.json();
      setHint(data.hint);
    } catch (err) {
      console.error("Error fetching hint:", err);
      toast({
        title: "Error fetching hint",
        description: err instanceof Error ? err.message : "Failed to fetch hint",
        variant: "destructive",
      });
    }
  }

  // Add loadQuestions function
  async function loadQuestions() {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching questions for jobSeekerId:", jobSeekerId);
      const response = await fetch(`/api/coding-test/${jobSeekerId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load questions");
      }

      const data = await response.json();
      console.log("Received questions data:", data);

      if (!Array.isArray(data) || data.length === 0) {
        console.error("No questions received from API");
        throw new Error("No questions available for this test");
      }

      setQuestions(data);
    } catch (error) {
      console.error("Loading error:", error);
      setError(error instanceof Error ? error.message : "Failed to load questions");
      toast({
        title: "Error Loading Questions",
        description: error instanceof Error ? error.message : "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (jobSeekerId) {
      loadQuestions();
    }
  }, [jobSeekerId]);

  // Single handleSubmit function
  async function handleSubmit(): Promise<void> {
    if (!currentQuestion || !code) return;

    try {
      setIsEvaluating(true);
      setActiveTab("solution");

      const result = await evaluateCode(code, currentQuestion);
      setEvaluationResult(result);

      // Store the evaluation data in localStorage
      localStorage.setItem(`evaluationResult-${jobSeekerId}`, JSON.stringify(result));
      localStorage.setItem(`submittedCode-${jobSeekerId}`, code);
      localStorage.setItem(`problemDetails-${jobSeekerId}`, JSON.stringify(currentQuestion));

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCode("");
        setEvaluationResult(null);
      } else {
        toast({
          title: "Test Completed",
          description: "Redirecting to results page...",
        });

        // Use the router from component level
        router.push(`/coding-test/${jobSeekerId}/result`);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to evaluate code",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-20 animate-pulse" />
          <div className="relative animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400" />
        </div>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="relative p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-4">
            {error || "No questions available"}
          </h1>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Background Elements */}
      <div
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] pointer-events-none"
        style={{
          backgroundSize: "30px 30px",
          opacity: 0.15,
        }}
      />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto px-6 py-12 max-w-8xl">
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 blur-sm bg-cyan-400 rounded-full animate-pulse" />
                  <div className="relative bg-cyan-400 rounded-full w-2 h-2" />
                </div>
                <h1 className="font-bold text-5xl tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
                    {currentQuestion.title}
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-8 pl-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10">
                  <div className="bg-red-400 rounded-full w-2 h-2" />
                  <span className="font-medium text-red-400/90 text-sm">
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10">
                  <div className="bg-yellow-400 rounded-full w-2 h-2" />
                  {currentQuestion.timeLimit && (
                    <Timer duration={currentQuestion.timeLimit} onComplete={handleSubmit} />
                  )}
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10">
                  <div className="bg-green-400 rounded-full w-2 h-2" />
                  <span className="font-medium text-green-400/90 text-sm">
                    {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-8 grid lg:grid-cols-2">
          {/* Problem Description */}
          <Card className="relative border-0 bg-white/5 backdrop-blur-xl overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10" />
            <div className="relative p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="border-white/[0.05] bg-white/[0.05] border">
                  <TabsTrigger value="problem" className="data-[state=active]:bg-white/[0.08]">
                    <Info className="mr-2 w-4 h-4" />
                    Problem
                  </TabsTrigger>
                  <TabsTrigger value="hint" className="data-[state=active]:bg-white/[0.08]">
                    <Lightbulb className="mr-2 w-4 h-4" />
                    Hint
                  </TabsTrigger>
                  <TabsTrigger value="solution" className="data-[state=active]:bg-white/[0.08]">
                    <Brain className="mr-2 w-4 h-4" />
                    Solution
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="problem" className="space-y-6 mt-6">
                  <div>
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {currentQuestion.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 font-medium text-lg text-white/90">Constraints</h3>
                    <ul className="space-y-2">
                      {currentQuestion.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <ArrowRight className="mt-1 w-4 h-4 text-purple-400" />
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 font-medium text-lg text-white/90">Examples</h3>
                    {currentQuestion.examples.map((example, index) => (
                      <div
                        key={index}
                        className="border-white/[0.05] bg-white/[0.02] mb-3 p-4 border rounded-lg"
                      >
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-purple-400">Input: </span>
                            <span className="text-gray-300">{example.input}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-400">Output: </span>
                            <span className="text-gray-300">{example.output}</span>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-medium text-cyan-400">Explanation: </span>
                              <span className="text-gray-300">{example.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hint" className="space-y-6 mt-6">
                  {hint ? (
                    <p className="text-gray-300 whitespace-pre-wrap">{hint}</p>
                  ) : (
                    <p className="text-gray-300">Loading hint...</p>
                  )}
                </TabsContent>

                <TabsContent value="solution" className="mt-6">
                  <div className="border-white/[0.05] border rounded-lg overflow-hidden">
                    <Editor
                      height="600px"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        hideCursorInOverviewRuler: true,
                        fontFamily: "JetBrains Mono, monospace",
                        padding: { top: 20 },
                        overviewRulerBorder: false,
                        scrollbar: {
                          vertical: "visible",
                          horizontal: "visible",
                          verticalScrollbarSize: 12,
                          horizontalScrollbarSize: 12,
                        },
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      className="bg-white/[0.05] hover:bg-white/[0.08] text-gray-300"
                      onClick={() => setCode("")}
                    >
                      Reset
                    </Button>
                    <div className="flex gap-2">
                      {currentQuestionIndex > 0 && (
                        <Button
                          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                          className="bg-white/[0.05] hover:bg-white/[0.08]"
                        >
                          <ChevronLeft className="mr-1 w-4 h-4" />
                          Previous
                        </Button>
                      )}
                      <Button
                        onClick={handleSubmit}
                        disabled={isEvaluating}
                        className="border-0 bg-gradient-to-r from-purple-500 hover:from-purple-600 to-blue-500 hover:to-blue-600 text-white"
                      >
                        {isEvaluating ? (
                          <>
                            <Cpu className="mr-2 w-4 h-4 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            {currentQuestionIndex < questions.length - 1 ? (
                              <>
                                Next Question
                                <ChevronRight className="ml-1 w-4 h-4" />
                              </>
                            ) : (
                              "Complete Test"
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          {/* Analysis Section */}
          <div className="space-y-6">
            {evaluationResult && (
              <div className="gap-6 grid">
                <CodeQualityMetricsCard metrics={evaluationResult.codeQualityMetrics} />
                <div className="gap-6 grid lg:grid-cols-2">
                  {/* Add other cards here */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
