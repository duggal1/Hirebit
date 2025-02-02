"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheatGuard } from "@/components/test/CheatGuard";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { submitTest } from "@/app/actions";
import { QuestionCard } from "@/components/test/QuestionCard";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 py-8 h-screen container">
      <div className="flex justify-between items-center">
        <div className="bg-muted/50 rounded-lg w-64 h-8 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="bg-muted/50 rounded-lg w-32 h-10 animate-pulse" />
          <div className="bg-muted/50 rounded-lg w-32 h-10 animate-pulse" />
        </div>
      </div>
      
      <div className="gap-6 grid grid-cols-2 h-[70vh]">
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-muted/50 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
        <div className="bg-muted/50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function CodingTest({ params }: { params: { jobId: string } }) {
  const [test, setTest] = useState<any>(null);
  const [code, setCode] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const jobRes = await fetch(`/api/jobs/${params.jobId}`);
        const job = await jobRes.json();
        
        const testRes = await fetch('/api/generate-test', {
          method: 'POST',
          body: JSON.stringify({ jobDescription: job.jobDescription })
        });
        
        const testData = await testRes.json();
        setTest(testData);
        setTimeLeft(testData.duration * 60);
        setLoading(false);
      } catch (error) {
        router.push(`/job/${params.jobId}?error=test_generation_failed`);
      }
    };

    fetchTest();
  }, [params.jobId, router]);

  useEffect(() => {
    if (!timeLeft) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) handleTimeout();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleViolation = async (count: number) => {
    if (count >= 3) {
      await submitTest(params.jobId, { status: 'cheated' });
      router.push(`/assessment/failed?reason=cheating`);
    }
  };

  const handleTimeout = async () => {
    await submitTest(params.jobId, { 
      code,
      status: 'timed_out'
    });
    router.push(`/assessment/failed?reason=timeout`);
  };

  const handleSubmit = async () => {
    const result = await submitTest(params.jobId, { 
      code,
      status: 'completed'
    });
    
    if (result.score >= 70) {
      router.push(`/application/${params.jobId}/success`);
    } else {
      router.push(`/assessment/failed?reason=score&score=${result.score}`);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="relative py-8 h-screen container">
      <CheatGuard onViolation={handleViolation} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">{test.skillsTested.join(', ')} Test</h1>
        <div className="flex items-center gap-4">
          <div className="bg-accent px-4 py-2 rounded-lg">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <Button onClick={handleSubmit} disabled={!code}>
            Submit Test
          </Button>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-2 h-[70vh]">
        <div className="space-y-4">
          {test.questions.map((q: any, i: number) => (
            <QuestionCard key={i} question={q} index={i} />
          ))}
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{ 
              minimap: { enabled: false },
              fontSize: 14 
            }}
          />
        </div>
      </div>
    </div>
  );
}