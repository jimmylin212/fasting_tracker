
"use client";

import React, { useState, useEffect } from 'react';
import { AddFastingLogForm } from '@/components/fasting/add-fasting-log-form';
import { FastingCalendarView } from '@/components/fasting/fasting-calendar-view';
import type { FastingLog } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// No initial mock data needed for this page, will load from localStorage or be empty
const initialLogs: FastingLog[] = [];

export default function FastingPage() {
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>(initialLogs);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedLogs = localStorage.getItem('fastingLogs');
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs, (key, value) => {
            if (key === 'startTime' || key === 'endTime') {
              return new Date(value);
            }
            return value;
          }) as FastingLog[];
          // Sort logs by start time, newest first
          setFastingLogs(parsedLogs.sort((a, b) => (b.startTime as Date).getTime() - (a.startTime as Date).getTime()));
        } catch (error) {
          console.error("Error parsing fasting logs from localStorage", error);
          setFastingLogs([]); // Fallback to empty array on error
        }
      } else {
        setFastingLogs([]); // No logs in storage, start with empty
      }
    }
  }, [isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('fastingLogs', JSON.stringify(fastingLogs));
    }
  }, [fastingLogs, isClient]);

  const handleAddLog = (newLogData: Omit<FastingLog, 'id'>) => {
    const newLog: FastingLog = {
      ...newLogData,
      id: Date.now().toString(), // Simple ID generation
    };
    setFastingLogs(prevLogs => 
      [newLog, ...prevLogs].sort((a, b) => (b.startTime as Date).getTime() - (a.startTime as Date).getTime())
    );
  };

  if (!isClient && fastingLogs.length === 0) { // Show skeleton only on initial load if logs are empty
    return (
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">Fasting Tracker</CardTitle>
            <CardDescription>Log your fasting periods and visualize your progress on the calendar.</CardDescription>
          </CardHeader>
        </Card>
        <Skeleton className="h-64 w-full" /> {/* Skeleton for form */}
        <Skeleton className="h-96 w-full" /> {/* Skeleton for calendar view */}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Fasting Tracker</CardTitle>
          <CardDescription>Log your fasting periods and visualize your progress on the calendar.</CardDescription>
        </CardHeader>
      </Card>

      <AddFastingLogForm onAddLog={handleAddLog} />
      {isClient && fastingLogs.length === 0 && <p className="text-center text-muted-foreground">No fasting logs yet. Add one to get started!</p>}
      <FastingCalendarView logs={fastingLogs} />
    </div>
  );
}
