
"use client";

import type { WorkoutLog } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type WorkoutLogListProps = {
  logs: WorkoutLog[];
};

export function WorkoutLogList({ logs }: WorkoutLogListProps) {
  if (logs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No workout data yet. Add your first log to see your history.</p>
        </CardContent>
      </Card>
    );
  }

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateStr = format(log.date, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(log);
    return acc;
  }, {} as Record<string, WorkoutLog[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Workout History</CardTitle>
        <CardDescription>Your logged workout sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-3">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-card py-2 ">{format(new Date(dateStr), 'PPP')}</h3>
              <ul className="space-y-3">
                {groupedLogs[dateStr].map((log) => (
                  <li key={log.id} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-semibold text-md">{log.workoutType}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mt-1">
                      <span>Weight: {log.weight} kg</span>
                      <span>Reps: {log.reps}</span>
                      <span>Sets: {log.sets}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
