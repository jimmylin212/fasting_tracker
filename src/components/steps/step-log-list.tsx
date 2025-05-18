
"use client";

import type { StepLog } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footprints, Flame } from 'lucide-react'; // Flame for calories

type StepLogListProps = {
  logs: StepLog[];
};

export function StepLogList({ logs }: StepLogListProps) {
  if (logs.length === 0) {
    // This case might be handled by the parent page, but good to have a fallback.
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Steps History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No step data yet.</p>
        </CardContent>
      </Card>
    );
  }

  const groupedLogs = logs.reduce((acc, log) => {
    const dateStr = format(log.date, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(log); // Logs are already sorted by parent, so daily entries should be chronological if added so.
    return acc;
  }, {} as Record<string, StepLog[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Steps History</CardTitle>
        <CardDescription>Your logged daily step counts and estimated calories burned.</CardDescription>
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
                      <div className="flex items-center">
                        <Footprints className="mr-2 h-5 w-5 text-primary" />
                        <span className="font-semibold text-md">{log.steps.toLocaleString()} steps</span>
                      </div>
                      {log.caloriesBurned !== undefined && (
                        <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                           <Flame className="mr-1 h-4 w-4" />
                           <span>~{log.caloriesBurned.toLocaleString()} kcal</span>
                        </div>
                      )}
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
