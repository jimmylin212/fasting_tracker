
"use client";

import type { WorkoutLog } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react'; // Added Edit3 icon

type WorkoutLogListProps = {
  logs: WorkoutLog[];
  onWorkoutTypeSelect: (workoutType: string) => void;
  onEditLogRequest: (log: WorkoutLog) => void; // New prop for requesting an edit
};

export function WorkoutLogList({ logs, onWorkoutTypeSelect, onEditLogRequest }: WorkoutLogListProps) {
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
        <CardDescription>Your logged workout sessions. Click on a workout type to see its trend. Use the edit button to modify an entry.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-3">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-card py-2 ">{format(new Date(dateStr), 'PPP')}</h3>
              <ul className="space-y-3">
                {groupedLogs[dateStr].map((log) => (
                  <li key={log.id} className="p-3 border rounded-md bg-muted/50">
                    <div className="flex justify-between items-center mb-1">
                        <button
                        onClick={() => onWorkoutTypeSelect(log.workoutType)}
                        className="font-semibold text-md hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded transition-colors"
                        aria-label={`View trend for ${log.workoutType}`}
                        >
                        {log.workoutType}
                        </button>
                        <Button variant="ghost" size="icon" onClick={() => onEditLogRequest(log)} aria-label="Edit workout log">
                            <Edit3 className="h-4 w-4" />
                        </Button>
                    </div>
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
