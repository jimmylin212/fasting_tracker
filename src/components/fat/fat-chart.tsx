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
import type { FatLog } from "@/lib/types";

type FatChartProps = {
  logs: FatLog[];
};

const chartConfig = {
  fatPercentage: {
    label: "Body Fat %",
    color: "hsl(var(--chart-2))", // Using chart-2 color
  },
} satisfies ChartConfig;

export function FatChart({ logs }: FatChartProps) {
  const chartData = logs
    .map(log => ({
      date: log.date,
      fatPercentage: log.fatPercentage,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Ensure data is sorted by date

  if (logs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Body Fat Trend</CardTitle>
          <CardDescription>Your body fat percentage progress over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No body fat data yet. Add your first log to see the chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Body Fat Trend</CardTitle>
        <CardDescription>Your body fat percentage progress over time.</CardDescription>
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
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => `${value}%`} hideLabel />}
              />
              <Line
                dataKey="fatPercentage"
                type="monotone"
                stroke="var(--color-fatPercentage)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-fatPercentage)",
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
