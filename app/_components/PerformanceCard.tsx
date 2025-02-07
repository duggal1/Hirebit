import { Card } from "@/components/ui/card";
import { Performance } from "@/types/code";
import { Activity, Clock, Cpu, MemoryStick } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PerformanceCardProps {
  performance: Performance;
}

export default function PerformanceCard({ performance }: PerformanceCardProps) {
  const metrics = [
    {
      icon: Clock,
      label: "Time Complexity",
      value: performance.timeComplexity,
      color: "text-blue-400",
    },
    {
      icon: MemoryStick ,
      label: "Space Complexity",
      value: performance.spaceComplexity,
      color: "text-purple-400",
    },
    {
      icon: Cpu,
      label: "Runtime",
      value: `${performance.runtime}ms`,
      color: "text-cyan-400",
    },
    {
      icon: Activity,
      label: "Memory Usage",
      value: `${performance.memoryUsage}MB`,
      color: "text-green-400",
    },
  ];

  const chartData = performance.benchmarkData.map((data, index) => ({
    name: `Test ${index + 1}`,
    runtime: data.runtime,
    memory: data.memoryUsage,
  }));

  return (
    <Card className="relative overflow-hidden border border-white/[0.05] bg-black/20 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
      <div className="relative p-6 space-y-8">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Performance Metrics
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <h3 className="text-lg font-medium text-white/90">{metric.label}</h3>
                </div>
                <p className={`text-xl font-semibold ${metric.color}`}>{metric.value}</p>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-lg font-medium text-white/90 mb-4">Performance Over Test Cases</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="left"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  label={{
                    value: "Runtime (ms)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "rgba(255,255,255,0.5)" },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  label={{
                    value: "Memory (MB)",
                    angle: 90,
                    position: "insideRight",
                    style: { fill: "rgba(255,255,255,0.5)" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="runtime"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={{ fill: "#60A5FA" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="memory"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  dot={{ fill: "#A78BFA" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}
