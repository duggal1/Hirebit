
"use client"


import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from "@monaco-editor/react";
import { ArrowRight, Brain, Info, ChevronLeft, ChevronRight, Cpu } from "lucide-react";
import { evaluateCode } from '@/services/gemini';
import { toast } from "@/app/_components/ui/use-toast";
import Timer from '@/app/_components/Timer';
import CodeQualityMetricsCard from "@/app/_components/CodeQualityMetricsCard";
import { CodeProblem, EvaluationResult } from "@/types/code";
export default function CodingTest() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<CodeProblem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("problem");
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  // Add loadQuestions function
  async function loadQuestions() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/coding-test/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No questions available');
      }

      setQuestions(data);
    } catch (error) {
      console.error('Loading error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }

  // Add useEffect for loading questions
  useEffect(() => {
    if (params?.id) {
      loadQuestions();
    }
  }, [params?.id]);

  // Single handleSubmit function
  async function handleSubmit(): Promise<void> {
    if (!currentQuestion || !code) return;

    try {
      setIsEvaluating(true);
      setActiveTab("solution");

      const result = await evaluateCode(code, currentQuestion);
      setEvaluationResult(result);

      // Store the evaluation data in localStorage
      localStorage.setItem(`evaluationResult-${params.id}`, JSON.stringify(result));
      localStorage.setItem(`submittedCode-${params.id}`, code);
      localStorage.setItem(`problemDetails-${params.id}`, JSON.stringify(currentQuestion));

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCode("");
        setEvaluationResult(null);
      } else {
        toast({
          title: "Test Completed",
          description: "Redirecting to results page...",
        });
        
        // Use the router from component level
        router.push(`/coding-test/${params.id}/result`);
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to evaluate code",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex] || null;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          {error || 'No questions available'}
        </h1>
        <Button
          onClick={() => router.push('/dashboard')}
          className="bg-white/[0.05] hover:bg-white/[0.08]"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="relative bg-black min-h-screen text-white">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center pointer-events-none [mask-image:radial-gradient(white,transparent_85%)]"
        style={{ 
          backgroundSize: "30px 30px",
          opacity: 0.2,
        }} 
      />

      <div className="relative mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-400 rounded-full w-1.5 h-1.5 animate-pulse" />
                <h1 className="font-bold text-4xl">
                  <span className="bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent">
                    {currentQuestion.title}
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-6 pl-4">
                <div className="flex items-center gap-2">
                  <div className="bg-red-400 rounded-full w-2 h-2" />
                  <span className="font-medium text-red-400/90 text-sm">
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                <div className="bg-yellow-400 rounded-full w-2 h-2" />
                  {/* Timer moved here and wrapped in null check */}
                  {currentQuestion.timeLimit && (
                    <Timer 
                      duration={currentQuestion.timeLimit} 
                      onComplete={handleSubmit}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-400 rounded-full w-2 h-2" />
                  <span className="font-medium text-green-400/90 text-sm">
                  {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-6 grid lg:grid-cols-2">
          {/* Problem Description */}
          <Card className="relative border-white/[0.05] bg-black/20 backdrop-blur-xl border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5" />
            <div className="relative p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="border-white/[0.05] bg-white/[0.05] border">
                  <TabsTrigger value="problem" className="data-[state=active]:bg-white/[0.08]">
                    <Info className="mr-2 w-4 h-4" />
                    Problem
                  </TabsTrigger>
                  <TabsTrigger value="solution" className="data-[state=active]:bg-white/[0.08]">
                    <Brain className="mr-2 w-4 h-4" />
                    Solution
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="problem" className="space-y-6 mt-6">
                  <div>
                    <p className="text-gray-300 whitespace-pre-wrap">{currentQuestion.description}</p>
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
                          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
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