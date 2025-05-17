
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FastingLog } from '@/lib/types';
import { format, formatDistanceStrict, addHours } from 'date-fns';
import { Hourglass, PlayCircle, StopCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to convert Firestore Timestamps to Dates for a single log
const convertLogTimestampsToDates = (log: any): FastingLog => {
  return {
    ...log,
    id: log.id,
    startTime: (log.startTime as Timestamp)?.toDate ? (log.startTime as Timestamp).toDate() : new Date(log.startTime),
    endTime: (log.endTime as Timestamp)?.toDate ? (log.endTime as Timestamp).toDate() : new Date(log.endTime),
  } as FastingLog;
};


export default function HomePage() {
  const { currentUser } = useAuth();
  const [currentFast, setCurrentFast] = useState<FastingLog | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("0 seconds");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // This useEffect will listen for all fasting logs for the user.
  // Then, findCurrentFast will determine the active one.
  useEffect(() => {
    if (!currentUser) {
      setCurrentFast(null);
      setLoadingStatus(false);
      return;
    }

    setLoadingStatus(true);
    setError(null);

    const fastingLogsCollectionRef = collection(db, 'users', currentUser.uid, 'fastingLogs');
    const q = query(fastingLogsCollectionRef, orderBy('startTime', 'desc')); // Get all, newest first

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const now = new Date();
      let activeFast: FastingLog | null = null;

      for (const document of querySnapshot.docs) {
        const logData = convertLogTimestampsToDates({ id: document.id, ...document.data() });
        if (logData.startTime <= now && (logData.endTime === null || (logData.endTime as Date) > now)) {
          activeFast = logData;
          break; // Found the most recent active fast
        }
      }
      setCurrentFast(activeFast);
      setLoadingStatus(false);
    }, (err) => {
      console.error("Error fetching fasting status: ", err);
      setError("Failed to load fasting status.");
      setLoadingStatus(false);
    });

    return () => unsubscribe();
  }, [currentUser]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentFast && currentFast.endTime) { // Ensure endTime is a Date
      interval = setInterval(() => {
        const now = new Date();
        if (now >= (currentFast.endTime as Date)) {
          setCurrentFast(null); // Fast has ended
        } else {
          setElapsedTime(formatDistanceStrict(now, currentFast.startTime as Date, { addSuffix: false }));
        }
      }, 1000);
    } else if (currentFast && !currentFast.endTime) { // Fast is ongoing without a defined end
       interval = setInterval(() => {
        const now = new Date();
        setElapsedTime(formatDistanceStrict(now, currentFast.startTime as Date, { addSuffix: false }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentFast]);

  const handleStartFast = async () => {
    if (!currentUser) {
      setError("You must be logged in to start a fast.");
      return;
    }
    const now = new Date();
    const newFastData = {
      startTime: Timestamp.fromDate(now),
      endTime: Timestamp.fromDate(addHours(now, 16)), // Default 16 hour fast
      notes: "Started from home page",
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    };
    try {
      const fastingLogsCollectionRef = collection(db, 'users', currentUser.uid, 'fastingLogs');
      await addDoc(fastingLogsCollectionRef, newFastData);
      // onSnapshot will update currentFast
    } catch (err) {
      console.error("Error starting fast: ", err);
      setError("Failed to start fast. Please try again.");
    }
  };

  const handleEndFastNow = async () => {
    if (currentFast && currentUser) {
      const now = new Date();
      try {
        const fastDocRef = doc(db, 'users', currentUser.uid, 'fastingLogs', currentFast.id);
        await updateDoc(fastDocRef, {
          endTime: Timestamp.fromDate(now),
        });
        // onSnapshot will update currentFast
      } catch (err) {
        console.error("Error ending fast: ", err);
        setError("Failed to end fast. Please try again.");
      }
    }
  };

  if (loadingStatus) {
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
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
     return <div className="text-destructive text-center py-10">{error}</div>;
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
                Started: {format(currentFast.startTime as Date, "MMM d, yyyy 'at' HH:mm")}
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
        </CardContent>
      </Card>
    </div>
  );
}
