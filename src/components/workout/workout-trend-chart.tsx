
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
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegendContent
} from "@/components/ui/chart";
import type { WorkoutLog } from "@/lib/types";

type WorkoutTrendChartProps = {
  logs: WorkoutLog[];
  selectedWorkoutType: string;
};

const chartConfig = {
  totalVolume: {
    label: `Total Volume`, // Legend label
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function WorkoutTrendChart({ logs, selectedWorkoutType }: WorkoutTrendChartProps) {
  const filteredLogs = logs
    .filter(log => log.workoutType === selectedWorkoutType)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredLogs.length < 2) {
    return (
        <div className="text-center text-muted-foreground py-8">
          <p>Not enough data to display a trend for {selectedWorkoutType}.</p>
          <p>Please log at least two sessions for this workout type.</p>
        </div>
    );
  }
  
  const chartData = filteredLogs.map(log => ({
    date: log.date,
    weight: log.weight,
    reps: log.reps,
    sets: log.sets,
    totalVolume: log.weight * log.reps * log.sets,
  }));


  return (
        <ChartContainer config={chartConfig} className="aspect-video h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MMM d")}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                yAxisId="left" 
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']} 
                label={{ value: 'Total Volume (kg × reps × sets)', angle: -90, position: 'insideLeft', offset:0, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => { // value is totalVolume, name is "Total Volume"
                      if (props.payload) {
                        const { weight, reps, sets } = props.payload;
                        return (
                          <div className="text-sm">
                            <div className="font-semibold">{chartConfig.totalVolume.label}: {value}</div>
                            <div className="text-xs text-muted-foreground">
                              Details: {weight} kg × {reps} reps × {sets} sets
                            </div>
                          </div>
                        );
                      }
                      return `${value}`;
                    }}
                    labelFormatter={(label, payload) => { 
                        if (payload && payload.length > 0 && payload[0].payload.date) {
                           return format(new Date(payload[0].payload.date), "PPP");
                        }
                        return String(label); 
                    }}
                  />
                }
              />
              <Legend content={<ChartLegendContent />} />
              <Line
                yAxisId="left"
                dataKey="totalVolume" 
                name="Total Volume" // This name is used by Legend/Tooltip to match with chartConfig
                type="monotone"
                stroke="var(--color-totalVolume)" // Uses the key from chartConfig
                strokeWidth={2}
                dot={{ fill: "var(--color-totalVolume)" }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
  );
}
