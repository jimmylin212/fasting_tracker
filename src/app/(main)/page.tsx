
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FastingLog } from '@/lib/types';
import { format, formatDistanceStrict, addHours, isAfter, isBefore, isValid } from 'date-fns';
import { Hourglass, PlayCircle, StopCircle, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [currentFast, setCurrentFast] = useState<FastingLog | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("0 seconds");
  const [isClient, setIsClient] = useState(false);
  
  // Effect to run once on component mount to set isClient
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load all logs from localStorage when isClient becomes true
  useEffect(() => {
    if (isClient) {
      const storedLogs = localStorage.getItem('fastingLogs');
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs, (key, value) => {
            if (key === 'startTime' || key === 'endTime') {
              const date = new Date(value);
              return isValid(date) ? date : null; // Ensure dates are valid
            }
            return value;
          }) as FastingLog[];
          setFastingLogs(parsedLogs.filter(log => log.startTime && log.endTime).sort((a, b) => (b.startTime as Date).getTime() - (a.startTime as Date).getTime()));
        } catch (error) {
          console.error("Error parsing fasting logs from localStorage on Home:", error);
          setFastingLogs([]);
        }
      } else {
        setFastingLogs([]);
      }
    }
  }, [isClient]);

  // Save all logs to localStorage when fastingLogs state changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('fastingLogs', JSON.stringify(fastingLogs));
    }
  }, [fastingLogs, isClient]);

  // Determine current fast from loaded logs
  useEffect(() => {
    if (!isClient) return;

    const now = new Date();
    let activeFast: FastingLog | null = null;
    // Find the first log that is currently active (startTime is past, endTime is future)
    // This assumes logs are sorted with most recent startTime first, or we find the most relevant one.
    // For simplicity, let's find any log that is currently "active" based on its start/end times.
    // A more robust solution might ensure only one "current" fast can exist or take the latest one.
    for (const log of fastingLogs) {
      if (log.startTime && isBefore(log.startTime as Date, now) && 
          log.endTime && isAfter(log.endTime as Date, now)) {
        activeFast = log;
        break; 
      }
    }
    setCurrentFast(activeFast);
  }, [fastingLogs, isClient]); // Re-evaluate when fastingLogs change or client status changes

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (currentFast && currentFast.startTime && isClient) {
      const updateElapsedTime = () => {
        const now = new Date();
        if (currentFast.endTime && isBefore(currentFast.endTime as Date, now)) {
          // Fast has ended, clear currentFast which will stop the timer.
          // The useEffect watching fastingLogs will handle this if endTime was updated.
          // This handles cases where time naturally passes the endTime.
          setCurrentFast(null); 
          setElapsedTime("0 seconds");
        } else if (currentFast.startTime) {
          setElapsedTime(formatDistanceStrict(now, currentFast.startTime as Date, { addSuffix: false }));
        }
      };
      updateElapsedTime(); 
      interval = setInterval(updateElapsedTime, 1000);
    } else {
      setElapsedTime("0 seconds");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentFast, isClient]);

  const handleStartFast = () => {
    const now = new Date();
    const newFast: FastingLog = {
      id: Date.now().toString(),
      startTime: now,
      endTime: addHours(now, 16), // Default 16-hour fast
      notes: "Started from home page",
    };
    // Add new fast and update currentFast state immediately
    setFastingLogs(prevLogs => {
        const updatedLogs = [newFast, ...prevLogs].sort((a,b) => (b.startTime as Date).getTime() - (a.startTime as Date).getTime());
        // setCurrentFast(newFast); // This line is actually handled by the useEffect that watches fastingLogs
        return updatedLogs;
    });
  };

  const handleEndFastNow = () => {
    if (currentFast) {
      const now = new Date();
      setFastingLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === currentFast.id ? { ...log, endTime: now } : log
        ).sort((a, b) => (b.startTime as Date).getTime() - (a.startTime as Date).getTime())
      );
      // currentFast state will update via the useEffect that watches fastingLogs
    }
  };
  
  if (!isClient) {
    return (
       <div className="container mx-auto p-4 md:p-8">
        <Card className="shadow-xl max-w-md mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Skeleton className="h-16 w-16 mx-auto rounded-full" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="shadow-xl max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Fasting Status</CardTitle>
          <CardDescription>Your current fasting progress.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {currentFast ? (
            <>
              <Hourglass className="h-16 w-16 mx-auto text-primary" />
              <p className="text-xl font-semibold">Currently Fasting!</p>
              <p className="text-lg">
                Fasting for: <span className="font-medium text-primary">{elapsedTime}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Started: {currentFast.startTime ? format(currentFast.startTime as Date, "MMM d, yyyy 'at' HH:mm") : 'N/A'}
              </p>
              {currentFast.endTime && (
                <p className="text-sm text-muted-foreground">
                  Planned End: {format(currentFast.endTime as Date, "MMM d, yyyy 'at' HH:mm")}
                </p>
              )}
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
          <Button variant="outline" className="w-full mt-2" asChild>
            <Link href="/fasting">
              <CalendarDays className="mr-2 h-5 w-5" /> View Fasting Logs & Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
