
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FastingLog } from '@/lib/types';
import { differenceInSeconds, format, formatDistanceStrict, addHours } from 'date-fns';
import { Hourglass, PlayCircle, StopCircle } from 'lucide-react';

// Mock initial data - consistent with FastingPage for initial state if localStorage is empty
const initialLogs: FastingLog[] = [
  { id: '1', startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000), endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), notes: "Felt great!" },
  { id: '2', startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000), endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), notes: "A bit hungry towards the end." },
];

export default function HomePage() {
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [currentFast, setCurrentFast] = useState<FastingLog | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("0 seconds");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedLogs = localStorage.getItem('fastingLogs');
    if (storedLogs) {
      const parsedLogs = JSON.parse(storedLogs, (key, value) => {
        if (key === 'startTime' || key === 'endTime') {
          return new Date(value);
        }
        return value;
      }) as FastingLog[];
      setFastingLogs(parsedLogs.sort((a,b) => b.startTime.getTime() - a.startTime.getTime()));
    } else {
      // Set initial logs if local storage is empty, sorted newest first
      const sortedInitialLogs = initialLogs.sort((a,b) => b.startTime.getTime() - a.startTime.getTime());
      setFastingLogs(sortedInitialLogs);
      // Also save these initial logs to localStorage immediately
      localStorage.setItem('fastingLogs', JSON.stringify(sortedInitialLogs));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      // Sort logs by start time descending before saving
      const logsToSave = [...fastingLogs].sort((a,b) => b.startTime.getTime() - a.startTime.getTime());
      localStorage.setItem('fastingLogs', JSON.stringify(logsToSave));
    }
  }, [fastingLogs, isClient]);

  const findCurrentFast = useCallback(() => {
    const now = new Date();
    // Consider logs that have started
    const relevantLogs = fastingLogs
      .filter(log => log.startTime <= now)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()); // newest first

    if (relevantLogs.length > 0) {
      const latestStartedFast = relevantLogs[0];
      if (latestStartedFast.endTime > now) {
        setCurrentFast(latestStartedFast);
        return;
      }
    }
    setCurrentFast(null);
  }, [fastingLogs]);

  useEffect(() => {
    if (isClient) {
      findCurrentFast();
    }
  }, [fastingLogs, isClient, findCurrentFast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentFast && isClient) {
      interval = setInterval(() => {
        const now = new Date();
        if (now >= currentFast.endTime) {
          // Fast has ended, clear currentFast and stop interval
          findCurrentFast(); // Re-evaluate to clear currentFast
        } else {
          setElapsedTime(formatDistanceStrict(now, currentFast.startTime, { addSuffix: false }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentFast, isClient, findCurrentFast]);

  const handleStartFast = () => {
    const now = new Date();
    const newFast: FastingLog = {
      id: Date.now().toString(),
      startTime: now,
      endTime: addHours(now, 16), // Default 16 hour fast
      notes: "Started from home page",
    };
    setFastingLogs(prevLogs => [newFast, ...prevLogs].sort((a,b) => b.startTime.getTime() - a.startTime.getTime()));
  };

  const handleEndFastNow = () => {
    if (currentFast) {
      const now = new Date();
      const updatedLogs = fastingLogs.map(log =>
        log.id === currentFast.id ? { ...log, endTime: now } : log
      );
      setFastingLogs(updatedLogs.sort((a,b) => b.startTime.getTime() - a.startTime.getTime()));
    }
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>Loading status...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="shadow-xl max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Fasting Status</CardTitle>
          <CardDescription>Your current fasting progress.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {currentFast ? (
            <>
              <Hourglass className="h-16 w-16 mx-auto text-primary" />
              <p className="text-xl font-semibold">Currently Fasting!</p>
              <p className="text-lg">
                Fasting for: <span className="font-medium text-primary">{elapsedTime}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Started: {format(currentFast.startTime, "MMM d, yyyy 'at' HH:mm")}
              </p>
              <p className="text-sm text-muted-foreground">
                Planned End: {format(currentFast.endTime, "MMM d, yyyy 'at' HH:mm")}
              </p>
              <Button onClick={handleEndFastNow} variant="destructive" className="w-full">
                <StopCircle className="mr-2 h-5 w-5" /> End Fast Now
              </Button>
            </>
          ) : (
            <>
              <PlayCircle className="h-16 w-16 mx-auto text-gray-400" />
              <p className="text-xl font-semibold">You are not currently fasting.</p>
              <p className="text-muted-foreground">Ready to start your next fast?</p>
              <Button onClick={handleStartFast} className="w-full">
                <PlayCircle className="mr-2 h-5 w-5" /> Start 16-Hour Fast Now
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
