
"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StepLog } from "@/lib/types";

type StepsChartProps = {
  logs: StepLog[];
};

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--chart-1))",
  },
  caloriesBurned: {
    label: "Calories Burned (kcal)",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig;

export function StepsChart({ logs }: StepsChartProps) {
  const chartData = logs
    .map(log => ({
      date: log.date,
      steps: log.steps,
      caloriesBurned: log.caloriesBurned,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending for chart

  if (logs.length === 0) {
    // This case handled by parent page, but added for completeness
    return null; 
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Steps & Calories Trend</CardTitle>
        <CardDescription>Your daily steps and estimated calories burned over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MMM d")}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                yAxisId="steps"
                orientation="left"
                stroke="var(--color-steps)"
                tickFormatter={(value) => `${value.toLocaleString()}`}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="calories"
                orientation="right"
                stroke="var(--color-caloriesBurned)"
                tickFormatter={(value) => `${value.toLocaleString()}`}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={<ChartTooltipContent 
                    labelFormatter={(label, payload) => { 
                        if (payload && payload.length > 0 && payload[0].payload.date) {
                           return format(new Date(payload[0].payload.date), "PPP");
                        }
                        return String(label); 
                    }}
                    formatter={(value, name, props) => {
                        return `${Number(value).toLocaleString()} ${name === 'caloriesBurned' ? 'kcal' : '' }`.trim();
                    }}
                />}
              />
              <Legend content={<ChartLegendContent />} />
              <Bar
                yAxisId="steps"
                dataKey="steps"
                name="Steps"
                fill="var(--color-steps)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="calories"
                dataKey="caloriesBurned"
                name="Calories Burned"
                fill="var(--color-caloriesBurned)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
