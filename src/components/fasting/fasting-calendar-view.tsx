"use client";

import React, { useState, useMemo } from 'react';
import { format, differenceInHours, isSameDay, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { FastingLog } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type FastingCalendarViewProps = {
  logs: FastingLog[];
};

export function FastingCalendarView({ logs }: FastingCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fastingDayModifiers = useMemo(() => {
    const daysWithFasting: Date[] = [];
    logs.forEach(log => {
      let current = startOfDay(log.startTime);
      const end = startOfDay(log.endTime);
      // Create a new date for current to avoid modifying the original log.startTime
      let iterCurrent = new Date(current);
      while (iterCurrent <= end) {
        daysWithFasting.push(new Date(iterCurrent));
        iterCurrent.setDate(iterCurrent.getDate() + 1);
      }
    });
    return { fasting: daysWithFasting };
  }, [logs]);

  const fastingDayStyles = {
    fasting: {
      backgroundColor: 'hsl(var(--accent) / 0.3)',
      // color: 'hsl(var(--accent-foreground))', // Keep default text color for readability
      borderRadius: '0.0rem', // Square indicator
    },
    selected: {
       backgroundColor: 'hsl(var(--primary))',
       color: 'hsl(var(--primary-foreground))',
    }
  };
  
  const logsForSelectedDate = useMemo(() => {
    if (!selectedDate) return logs.sort((a,b) => b.startTime.getTime() - a.startTime.getTime()); 
    return logs.filter(log => 
      isSameDay(log.startTime, selectedDate) || 
      isSameDay(log.endTime, selectedDate) ||
      (log.startTime < selectedDate && log.endTime > selectedDate)
    ).sort((a,b) => b.startTime.getTime() - a.startTime.getTime());
  }, [logs, selectedDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <Card className="md:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>Fasting Calendar</CardTitle>
          <CardDescription>Days with fasting periods are highlighted. Select a day to see details.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={fastingDayModifiers}
            modifiersStyles={fastingDayStyles}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle>
            Logs for {selectedDate ? format(selectedDate, 'PPP') : 'All Dates'}
          </CardTitle>
          <CardDescription>Detailed fasting entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {logsForSelectedDate.length > 0 ? (
            <ScrollArea className="h-[300px] pr-3">
              <ul className="space-y-3">
                {logsForSelectedDate.map((log) => {
                  const duration = differenceInHours(log.endTime, log.startTime);
                  const startTimeFormatted = format(log.startTime, 'MMM d, HH:mm');
                  const endTimeFormatted = isSameDay(log.startTime, log.endTime)
                    ? format(log.endTime, 'HH:mm')
                    : format(log.endTime, 'MMM d, HH:mm');
                  
                  return (
                    <li key={log.id} className="p-3 border rounded-md bg-muted/50">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-sm">
                          {startTimeFormatted} - {endTimeFormatted}
                        </p>
                        <Badge variant="secondary">{duration} hours</Badge>
                      </div>
                       {log.notes && <p className="text-xs text-muted-foreground italic mt-1">{log.notes}</p>}
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No fasting logs for this day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
