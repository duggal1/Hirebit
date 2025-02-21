
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
import LoadingState from "@/components/loading/Loadingstate/loading";

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
      <div className="flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-light text-neutral-100 mb-4">
          Wait while we generate your personalized coding questions!
        </span>
        <LoadingState />
      </div>
    );
  }   

  if (error || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="p-8 rounded-lg bg-gray-800">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            {error || "No questions available"}
          </h1>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-700 hover:bg-gray-600 transition duration-300"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Ambient background effect */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,50,255,0.05),transparent_50%)]" />
      </div>

      <div className="relative mx-auto px-6 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                {currentQuestion?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">{currentQuestion?.difficulty}</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50">
                  <Timer duration={currentQuestion?.timeLimit} onComplete={handleSubmit} />
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">
                    {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl">
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex space-x-4 p-1 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                  <TabsTrigger 
                    value="problem" 
                    className="flex items-center px-6 py-3 rounded-lg text-sm transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/50 data-[state=active]:shadow-lg"
                  >
                    <Info className="mr-2 w-4 h-4" />
                    Problem
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hint"
                    className="flex items-center px-6 py-3 rounded-lg text-sm transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/50 data-[state=active]:shadow-lg"
                  >
                    <Lightbulb className="mr-2 w-4 h-4" />
                    Hint
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solution"
                    className="flex items-center px-6 py-3 rounded-lg text-sm transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/50 data-[state=active]:shadow-lg"
                  >
                    <Brain className="mr-2 w-4 h-4" />
                    Solution
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="problem" className="mt-6 space-y-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">
                      {currentQuestion?.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-4">
                      Constraints
                    </h3>
                    <ul className="space-y-3">
                      {(currentQuestion?.constraints ?? []).map((constraint, index) => (
                        <li key={index} className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-xl backdrop-blur-sm">
                          <ArrowRight className="mt-1 w-5 h-5 text-purple-400" />
                          <span className="text-gray-300">{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-4">
                      Examples
                    </h3>
                    {(currentQuestion?.examples ?? []).map((example, index) => (
                      <div
                        key={index}
                        className="mb-4 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl backdrop-blur-sm"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-400">Input:</span>
                            <code className="px-3 py-1 bg-gray-900/50 rounded-lg text-gray-300">
                              {example.input}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-400">Output:</span>
                            <code className="px-3 py-1 bg-gray-900/50 rounded-lg text-gray-300">
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-cyan-400">Explanation:</span>
                              <span className="text-gray-300">{example.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="solution" className="mt-6">
                  <div className="overflow-hidden rounded-xl border border-gray-800/50 backdrop-blur-xl">
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
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      className="px-6 py-3 bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/50 text-gray-300 backdrop-blur-sm rounded-xl"
                      onClick={() => setCode("")}
                    >
                      Reset
                    </Button>
                    <div className="flex gap-3">
                      {currentQuestionIndex > 0 && (
                        <Button
                          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                          className="px-6 py-3 bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl"
                        >
                          <ChevronLeft className="mr-2 w-4 h-4" />
                          Previous
                        </Button>
                      )}
                      <Button
                        onClick={handleSubmit}
                        disabled={isEvaluating}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-700/80 hover:to-blue-700/80 text-white backdrop-blur-sm rounded-xl shadow-lg shadow-purple-500/20"
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
                                <ChevronRight className="ml-2 w-4 h-4" />
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

                <TabsContent value="hint" className="mt-6">
                  {hint ? (
                    <p className="text-gray-300 leading-relaxed bg-gray-800/30 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
                      {hint}
                    </p>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          {/* Analysis Section */}
          {evaluationResult && (
            <div className="space-y-6">
              <CodeQualityMetricsCard metrics={evaluationResult.codeQualityMetrics} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 