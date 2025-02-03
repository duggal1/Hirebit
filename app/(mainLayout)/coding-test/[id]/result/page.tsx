"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RocketIcon, CodeIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

interface ResultData {
  score: number;
  quality: "poor" | "average" | "good" | "excellent";
  feedback: string;
  suggestions: string[];
}

export default function ResultPage() {
  const params = useParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/test-results/${params.id}`);
        if (!res.ok) throw new Error("Failed to load results");
        const data = await res.json();
        setResult(data.results[0]);
      } catch (error) {
        console.error("Results error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [params.id]);

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center bg-gradient-to-br from-gray-900 to-black min-h-screen"
    >
      <div className="space-y-4 text-center">
        <RocketIcon className="mx-auto w-12 h-12 text-purple-500 animate-bounce" />
        <h2 className="bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold text-2xl text-transparent">
          Analyzing Your Code...
        </h2>
        <p className="text-gray-400">Crunching the numbers, one byte at a time</p>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-6 min-h-screen">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <Card className="border-gray-700 bg-gray-800 shadow-2xl">
          <CardHeader className="border-gray-700 p-6 border-b">
            <h1 className="bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold text-3xl text-transparent">
              Code Evaluation Results
            </h1>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <Progress 
                value={result?.score || 0} 
                className="flex-1 bg-gray-700 h-3"
                //indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-600"
              />
              <span className="bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold text-2xl text-transparent">
                {result?.score || 0}%
              </span>
            </div>

            <Badge 
              variant={result?.quality === "excellent" ? "default" : "secondary"}
              className="bg-gray-700 hover:bg-gray-600 font-medium text-sm"
            >
              <CodeIcon className="mr-2 w-4 h-4" />
              Code Quality: {result?.quality || "unknown"}
            </Badge>

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-white text-xl">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                Technical Feedback
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {result?.feedback || "No detailed feedback available"}
              </p>
            </div>

            {result?.suggestions?.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold text-white text-xl">
                  <AlertTriangleIcon className="w-5 h-5 text-yellow-400" />
                  Recommended Improvements
                </h3>
                <ul className="space-y-2 pl-6 list-disc">
                  {result.suggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="text-gray-300">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-gray-700 p-6 border-t">
            <Button 
              className="bg-gradient-to-r from-purple-500 hover:from-purple-600 to-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl rounded-lg w-full font-semibold text-white transform transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
              onClick={() => window.location.href = "/dashboard"}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}