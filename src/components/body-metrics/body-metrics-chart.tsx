
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
import type { BodyMetricsLog } from "@/lib/types";

type BodyMetricsChartProps = {
  logs: BodyMetricsLog[];
};

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
  fatPercentage: {
    label: "Body Fat %",
    color: "hsl(var(--chart-2))",
  },
  skeletalMuscleMassPercentage: {
    label: "SMM %", // Skeletal Muscle Mass Percentage
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function BodyMetricsChart({ logs }: BodyMetricsChartProps) {
  const chartData = logs
    .map(log => ({
      date: log.date,
      weight: log.weight,
      fatPercentage: log.fatPercentage,
      skeletalMuscleMassPercentage: log.skeletalMuscleMassPercentage,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (logs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Body Metrics Trend</CardTitle>
          <CardDescription>Your progress over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No body metrics data yet. Add your first log to see the chart.</p>
        </CardContent>
      </Card>
    );
  }

  // Determine Y-axis domains
  const weightValues = chartData.map(d => d.weight).filter(v => v !== undefined) as number[];
  const percentageValues = [
    ...chartData.map(d => d.fatPercentage).filter(v => v !== undefined) as number[],
    ...chartData.map(d => d.skeletalMuscleMassPercentage).filter(v => v !== undefined) as number[],
  ];

  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  const minPercentage = Math.min(...percentageValues);
  const maxPercentage = Math.max(...percentageValues);
  
  const weightDomain: [number | string, number | string] = [
    weightValues.length > 0 ? Math.floor(minWeight - 2) : 'auto',
    weightValues.length > 0 ? Math.ceil(maxWeight + 2) : 'auto',
  ];
  const percentageDomain: [number | string, number | string] = [
    percentageValues.length > 0 ? Math.max(0, Math.floor(minPercentage - 2)) : 'auto',
    percentageValues.length > 0 ? Math.min(100, Math.ceil(maxPercentage + 2)) : 'auto',
  ];


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Body Metrics Trend</CardTitle>
        <CardDescription>Weight, Body Fat %, and Skeletal Muscle Mass % over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MMM d")}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                yAxisId="weight"
                orientation="left"
                stroke="var(--color-weight)"
                tickFormatter={(value) => `${value}kg`}
                tickLine={false}
                axisLine={false}
                domain={weightDomain}
              />
              <YAxis
                yAxisId="percentage"
                orientation="right"
                stroke="var(--color-fatPercentage)" // Use one of the percentage colors for axis
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                domain={percentageDomain}
              />
              <Tooltip
                content={<ChartTooltipContent 
                    formatter={(value, name) => {
                        if (name === 'weight') return `${value} kg`;
                        return `${value}%`;
                    }}
                    labelFormatter={(label, payload) => { 
                        if (payload && payload.length > 0 && payload[0].payload.date) {
                           return format(new Date(payload[0].payload.date), "PPP");
                        }
                        return String(label); 
                    }}
                />}
              />
              <Legend content={<ChartLegendContent />} />
              <Line
                yAxisId="weight"
                dataKey="weight"
                type="monotone"
                stroke="var(--color-weight)"
                strokeWidth={2}
                dot={{ fill: "var(--color-weight)" }}
                activeDot={{ r: 6 }}
                connectNulls // Important if some entries don't have weight
              />
              <Line
                yAxisId="percentage"
                dataKey="fatPercentage"
                type="monotone"
                stroke="var(--color-fatPercentage)"
                strokeWidth={2}
                dot={{ fill: "var(--color-fatPercentage)" }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                yAxisId="percentage"
                dataKey="skeletalMuscleMassPercentage"
                type="monotone"
                stroke="var(--color-skeletalMuscleMassPercentage)"
                strokeWidth={2}
                dot={{ fill: "var(--color-skeletalMuscleMassPercentage)" }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
