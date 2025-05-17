
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
  type ChartConfig,
  ChartLegendContent 
} from "@/components/ui/chart";
import type { WorkoutLog } from "@/lib/types";

type WorkoutTrendChartProps = {
  logs: WorkoutLog[];
  selectedWorkoutType: string;
};

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
  
  const chartConfig: ChartConfig = {
    [selectedWorkoutType]: { 
      label: `Weight (KG)`, // Label for the legend
      color: "hsl(var(--chart-1))",
    },
  };

  // Ensure keys in chartConfig match the dataKey used in Line component.
  // Here, dataKey="weight", but we want legend to show selectedWorkoutType.
  // So, we modify data for the chart to have a key that chartConfig expects.
  const chartData = filteredLogs.map(log => ({
    date: log.date,
    reps: log.reps,
    sets: log.sets,
    [selectedWorkoutType]: log.weight, // Use workout type as key for weight
  }));


  return (
    // Card removed from here, as it's now part of the parent component's structure
    // <Card className="shadow-lg mt-0"> // No mt-8, parent handles spacing
    //   <CardHeader>
    //     <CardTitle>Progression: {selectedWorkoutType}</CardTitle>
    //     <CardDescription>Weight lifted over time for {selectedWorkoutType}.</CardDescription>
    //   </CardHeader>
    //   <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={chartData} // Use modified chartData
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
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
                tickFormatter={(value) => `${value} kg`}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']} 
                label={{ value: 'Weight (KG)', angle: -90, position: 'insideLeft', offset:10, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => { // name here will be selectedWorkoutType
                      if (props.payload) {
                        const { reps, sets } = props.payload;
                        return `${value} kg (${reps} reps x ${sets} sets)`;
                      }
                      return `${value} kg`;
                    }}
                    labelFormatter={(label, payload) => { // label is the x-axis value (date)
                        if (payload && payload.length > 0 && payload[0].payload.date) {
                           return format(new Date(payload[0].payload.date), "PPP");
                        }
                        return label; // Fallback, should not happen if data is correct
                    }}
                    nameKey={selectedWorkoutType} // Helps map to the correct label in config
                  />
                }
              />
              <Legend content={<ChartLegendContent />} />
              <Line
                yAxisId="left"
                dataKey={selectedWorkoutType} // Data key matches the one in chartData
                name={selectedWorkoutType} // Name for legend and tooltip identification
                type="monotone"
                stroke={`var(--color-${selectedWorkoutType})`} // Use the dynamic key from chartConfig
                strokeWidth={2}
                dot={{ fill: `var(--color-${selectedWorkoutType})` }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
    //   </CardContent>
    // </Card>
  );
}

