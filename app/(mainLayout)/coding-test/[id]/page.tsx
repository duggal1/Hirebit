"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import { CheatGuard } from "@/components/test/CheatGuard";
import { Editor } from "@monaco-editor/react";
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
import { getJobForTest, submitTestResults } from "@/app/actions/coding-test";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, RocketIcon } from "@/components/icons";
import { CheckCircleIcon, AlertTriangleIcon, Code2Icon, BookOpenIcon, BrainCircuitIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFormState } from "react-dom";

interface TestData {
  problem_statement: string;
  requirements: {
    functional: string[];
    technical: string[];
    constraints: string[];
  };
  starter_code: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
    explanation: string;
  }>;
  evaluation_criteria: {
    code_quality: number;
    performance: number;
    architecture: number;
    testing: number;
    documentation: number;
  };
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
  efficiency: "low" | "medium" | "high";
  quality: "poor" | "average" | "excellent";
  suggestions: string[];
  realTimeSuggestions: string[];
  jobFitAnalysis: {
    strengthsForRole: string[];
    areasToImprove: string[];
    overallJobFit: string;
  };
  scalabilityScore: number;
  faultToleranceScore: number;
}

interface ComplexQuestion {
  id: string;
  title: string;
  problem_statement: string;
  business_context: string;
  technical_requirements: {
    functional: string[];
    system_design: string[];
    performance: string[];
    security: string[];
  };
  constraints: string[];
  hints: string[];
  test_scenarios: {
    scenario: string;
    requirements: string;
    acceptance_criteria: string;
  }[];
}

export default function CodingTestPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [code, setCode] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState<CodeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        const data = await getJobForTest(params.id as string);
        if (!data || !data.test) {
          setError("Failed to load test data");
          return;
        }
        setJob(data);
        setQuestions(data.test || []);
        setCode(data.test?.[0]?.starter_code || '');
        setTestData(data.test?.[0] || null);
        setTimeLeft(data.test.duration * 60);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [params.id]);

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

      if (!response.ok) throw new Error("Evaluation failed");
      
      const result = await response.json();
      
      await submitTestResults({
        jobId: params.id as string,
        code,
        results: [result],
        status: result.score > 70 ? "SHORTLISTED" : "REJECTED",
        score: result.score
      });

      router.push(`/coding-test/${params.id}/result`);
    } catch (error) {
      toast.error("Failed to submit test: " + (error as Error).message);
    }
  };

  if (loading) {
    return (
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
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-6 max-w-md">
          <AlertTriangleIcon className="mx-auto mb-4 w-12 h-12 text-destructive" />
          <h2 className="mb-2 font-bold text-2xl text-center">Error Loading Test</h2>
          <p className="text-center text-muted-foreground">{error}</p>
          <Button 
            className="mt-4 w-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!testData?.problem_statement) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-6 max-w-md">
          <AlertTriangleIcon className="mx-auto mb-4 w-12 h-12 text-destructive" />
          <h2 className="mb-2 font-bold text-2xl text-center">Test Not Available</h2>
          <p className="text-center text-muted-foreground">
            The test questions could not be loaded. Please try again later.
          </p>
          <Button 
            className="mt-4 w-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur border-b">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-xl">Technical Assessment</h1>
            <Badge variant={timeLeft < 300 ? "destructive" : "secondary"}>
              {formatTime(timeLeft)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setCurrentQuestion(prev => 
                prev > 0 ? prev - 1 : prev
              )}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentQuestion(prev => 
                prev < 4 ? prev + 1 : prev
              )}
              disabled={currentQuestion === 4}
            >
              Next
            </Button>
            <form action={handleSubmit}>
              <SubmitButton />
            </form>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="border-b">
        <div className="flex gap-2 p-2">
          {[0,1,2,3,4].map(idx => (
            <Button
              key={idx}
              variant={currentQuestion === idx ? "default" : "outline"}
              onClick={() => setCurrentQuestion(idx)}
              className="p-0 w-10 h-10"
            >
              {idx + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 gap-4 grid grid-cols-2 p-4 overflow-hidden">
        {/* Left panel - Problem description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-y-auto"
        >
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 font-bold text-2xl">
                  {currentQ?.problem_statement}
                </h2>
              </div>

              <Separator />

              <div className="space-y-4">
                <TechnicalRequirements 
                  requirements={currentQ?.requirements} 
                />
                <TestCases 
                  cases={currentQ?.test_cases} 
                />
                <EvaluationCriteria 
                  criteria={currentQ?.evaluation_criteria} 
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right panel - Code editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          <Card className="flex-1 overflow-hidden">
            <Tabs defaultValue="code" className="flex flex-col h-full">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="flex-1 p-0">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    readOnly: completed,
                  }}
                />
              </TabsContent>
              <TabsContent value="output" className="flex-1 p-4">
                {realTimeFeedback && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <QualityIndicator
                        label="Code Quality"
                        value={realTimeFeedback.quality}
                      />
                      <QualityIndicator
                        label="Efficiency"
                        value={realTimeFeedback.efficiency}
                      />
                    </div>
                    {realTimeFeedback.jobFitAnalysis && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Job Fit Analysis</h4>
                        <p className="text-muted-foreground text-sm">
                          {realTimeFeedback.jobFitAnalysis.overallJobFit}
                        </p>
                      </div>
                    )}
                    {realTimeFeedback.suggestions?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Improvement Suggestions:</h4>
                        <ul className="space-y-1 text-sm">
                          {realTimeFeedback.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex gap-2">
                              <span>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {realTimeFeedback.realTimeSuggestions?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Real-time Feedback:</h4>
                        <ul className="space-y-1 text-sm">
                          {realTimeFeedback.realTimeSuggestions.map((suggestion, i) => (
                            <li key={i} className="flex gap-2">
                              <span>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(realTimeFeedback.scalabilityScore !== undefined || 
                      realTimeFeedback.faultToleranceScore !== undefined) && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Performance Metrics</h4>
                        <div className="gap-4 grid grid-cols-2">
                          {realTimeFeedback.scalabilityScore !== undefined && (
                            <div>
                              <span className="text-muted-foreground text-sm">Scalability</span>
                              <Progress value={realTimeFeedback.scalabilityScore} />
                            </div>
                          )}
                          {realTimeFeedback.faultToleranceScore !== undefined && (
                            <div>
                              <span className="text-muted-foreground text-sm">Fault Tolerance</span>
                              <Progress value={realTimeFeedback.faultToleranceScore} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      <CheatGuard onViolation={async () => {
        toast.error("Test terminated due to violation");
        await submitTestResults({
          jobId: params.id as string,
          code: "",
          results: [],
          status: "REJECTED",
          score: 0
        });
        router.push("/");
      }} />
    </div>
  );
}

// Helper components
function RequirementSection({ title, items, icon }: { 
  title: string; 
  items: string[];
  icon: string;
}) {
  return (
    <div>
      <h4 className="mb-2 font-medium text-muted-foreground text-sm">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestCase({ input, expected_output, explanation }: {
  input: string;
  expected_output: string;
  explanation: string;
}) {
  return (
    <div className="bg-muted/50 p-3 rounded-lg text-sm">
      <div className="gap-2 grid grid-cols-2 mb-2">
        <div>
          <span className="font-medium text-muted-foreground text-xs">Input:</span>
          <pre className="bg-muted mt-1 p-1 rounded text-xs">{input}</pre>
        </div>
        <div>
          <span className="font-medium text-muted-foreground text-xs">Expected:</span>
          <pre className="bg-muted mt-1 p-1 rounded text-xs">{expected_output}</pre>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">{explanation}</p>
    </div>
  );
}

function QualityIndicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-background/80 px-3 py-1 border rounded-full">
      <div className={cn(
        "w-2 h-2 rounded-full",
        value === 'excellent' ? 'bg-green-500' :
        value === 'average' ? 'bg-yellow-500' : 'bg-red-500'
      )} />
      <span className="font-medium text-sm">
        {label}: {value || 'Analyzing...'}
      </span>
    </div>
  );
}

function TechnicalRequirements({ requirements }: { 
  requirements?: { 
    functional?: string[]; 
    system_design?: string[]; 
    performance?: string[]; 
    security?: string[]; 
  } 
}) {
  if (!requirements) return null;

  return (
    <div>
      <h3 className="mb-2 font-semibold">Technical Requirements</h3>
      <div className="space-y-4">
        {requirements.functional && requirements.functional.length > 0 && (
          <RequirementSection
            title="Functional Requirements"
            items={requirements.functional}
            icon="✓"
          />
        )}
        {requirements.system_design && requirements.system_design.length > 0 && (
          <RequirementSection
            title="System Design Requirements"
            items={requirements.system_design}
            icon="⚡"
          />
        )}
        {requirements.performance && requirements.performance.length > 0 && (
          <RequirementSection
            title="Performance Requirements"
            items={requirements.performance}
            icon="⚡"
          />
        )}
        {requirements.security && requirements.security.length > 0 && (
          <RequirementSection
            title="Security Requirements"
            items={requirements.security}
            icon="🔒"
          />
        )}
      </div>
    </div>
  );
}

function Constraints({ constraints }: { constraints: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">Constraints</h3>
      <ul className="space-y-1">
        {constraints.map((constraint, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5">⚠</span>
            <span>{constraint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestScenarios({ scenarios }: { scenarios: { scenario: string; requirements: string; acceptance_criteria: string }[] }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">Test Scenarios</h3>
      <div className="space-y-3">
        {scenarios.map((scenario, index) => (
          <div key={index} className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="gap-2 grid grid-cols-2 mb-2">
              <div>
                <span className="font-medium text-muted-foreground text-xs">Scenario:</span>
                <pre className="bg-muted mt-1 p-1 rounded text-xs">{scenario.scenario}</pre>
              </div>
              <div>
                <span className="font-medium text-muted-foreground text-xs">Requirements:</span>
                <pre className="bg-muted mt-1 p-1 rounded text-xs">{scenario.requirements}</pre>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">{scenario.acceptance_criteria}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestCases({ cases }: { 
  cases: Array<{
    input: string;
    expected_output: string;
    explanation: string;
  }> 
}) {
  if (!cases?.length) return null;

  return (
    <div>
      <h3 className="mb-2 font-semibold">Test Cases</h3>
      <div className="space-y-3">
        {cases.map((testCase, index) => (
          <TestCase
            key={index}
            input={testCase.input}
            expected_output={testCase.expected_output}
            explanation={testCase.explanation}
          />
        ))}
      </div>
    </div>
  );
}

function EvaluationCriteria({ criteria }: {
  criteria: {
    code_quality: number;
    performance: number;
    architecture: number;
    testing: number;
    documentation: number;
  }
}) {
  if (!criteria) return null;

  const criteriaItems = [
    { label: 'Code Quality', value: criteria.code_quality },
    { label: 'Performance', value: criteria.performance },
    { label: 'Architecture', value: criteria.architecture },
    { label: 'Testing', value: criteria.testing },
    { label: 'Documentation', value: criteria.documentation }
  ];

  return (
    <div>
      <h3 className="mb-2 font-semibold">Evaluation Criteria</h3>
      <div className="space-y-2">
        {criteriaItems.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
            <Progress value={item.value} />
          </div>
        ))}
      </div>
    </div>
  );
}
