"use client";

import React, { useState, useEffect } from 'react';
import { AddFastingLogForm } from '@/components/fasting/add-fasting-log-form';
import { FastingCalendarView } from '@/components/fasting/fasting-calendar-view';
import type { FastingLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock initial data - in a real app, this would come from a DB/API
const initialLogs: FastingLog[] = [
  { id: '1', startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000), endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), notes: "Felt great!" },
  { id: '2', startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000), endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), notes: "A bit hungry towards the end." },
];


export default function FastingPage() {
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load logs from localStorage or use initialLogs if localStorage is empty/first load
    const storedLogs = localStorage.getItem('fastingLogs');
    if (storedLogs) {
      setFastingLogs(JSON.parse(storedLogs, (key, value) => {
        if (key === 'startTime' || key === 'endTime') {
          return new Date(value);
        }
        return value;
      }));
    } else {
      setFastingLogs(initialLogs);
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('fastingLogs', JSON.stringify(fastingLogs));
    }
  }, [fastingLogs, isClient]);

  const handleAddLog = (newLogData: Omit<FastingLog, 'id'>) => {
    const newLog: FastingLog = {
      ...newLogData,
      id: Date.now().toString(), // Simple unique ID
    };
    setFastingLogs(prevLogs => [newLog, ...prevLogs]);
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>Loading tracker...</p></div>; 
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
      <FastingCalendarView logs={fastingLogs} />
    </div>
  );
}
