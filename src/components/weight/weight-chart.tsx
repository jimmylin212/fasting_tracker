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
  type ChartConfig,
} from "@/components/ui/chart";
import type { WeightLog } from "@/lib/types";

type WeightChartProps = {
  logs: WeightLog[];
};

const chartConfig = {
  weight: {
    label: "Weight",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function WeightChart({ logs }: WeightChartProps) {
  const chartData = logs
    .map(log => ({
      date: log.date,
      weight: log.weight,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Ensure data is sorted by date

  if (logs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Your weight progress over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No weight data yet. Add your first log to see the chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Weight Trend</CardTitle>
        <CardDescription>Your weight progress over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MMM d")}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="weight"
                type="monotone"
                stroke="var(--color-weight)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-weight)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
