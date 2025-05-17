
"use client";

import React, { useState, useEffect } from 'react';
import { AddFastingLogForm } from '@/components/fasting/add-fasting-log-form';
import { FastingCalendarView } from '@/components/fasting/fasting-calendar-view';
import type { FastingLog } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to convert Firestore Timestamps to Dates
const convertTimestampsToDates = (log: any): FastingLog => {
  return {
    ...log,
    id: log.id,
    startTime: (log.startTime as Timestamp)?.toDate ? (log.startTime as Timestamp).toDate() : new Date(log.startTime),
    endTime: (log.endTime as Timestamp)?.toDate ? (log.endTime as Timestamp).toDate() : new Date(log.endTime),
  } as FastingLog;
};


export default function FastingPage() {
  const { currentUser } = useAuth();
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoadingLogs(false);
      setFastingLogs([]); // Clear logs if user logs out
      return;
    }

    setLoadingLogs(true);
    setError(null);

    const fastingLogsCollectionRef = collection(db, 'users', currentUser.uid, 'fastingLogs');
    const q = query(fastingLogsCollectionRef, orderBy('startTime', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: FastingLog[] = [];
      querySnapshot.forEach((doc) => {
        logs.push(convertTimestampsToDates({ id: doc.id, ...doc.data() }));
      });
      setFastingLogs(logs);
      setLoadingLogs(false);
    }, (err) => {
      console.error("Error fetching fasting logs: ", err);
      setError("Failed to load fasting logs. Please try again later.");
      setLoadingLogs(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [currentUser]);

  const handleAddLog = async (newLogData: Omit<FastingLog, 'id' | 'userId'>) => {
    if (!currentUser) {
      setError("You must be logged in to add a log.");
      return;
    }
    try {
      const fastingLogsCollectionRef = collection(db, 'users', currentUser.uid, 'fastingLogs');
      await addDoc(fastingLogsCollectionRef, {
        ...newLogData,
        startTime: Timestamp.fromDate(newLogData.startTime as Date),
        endTime: Timestamp.fromDate(newLogData.endTime as Date),
        userId: currentUser.uid,
        createdAt: serverTimestamp() // Optional: for server-side timestamping of creation
      });
      // No need to manually update state, onSnapshot will handle it
    } catch (err) {
      console.error("Error adding fasting log: ", err);
      setError("Failed to save fasting log. Please try again.");
    }
  };

  if (loadingLogs && !fastingLogs.length) { // Show skeleton only on initial load or if logs are empty
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
  
  if (error) {
    return <div className="text-destructive text-center py-10">{error}</div>;
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
      {loadingLogs && fastingLogs.length > 0 && <p className="text-center text-muted-foreground">Updating logs...</p>}
      <FastingCalendarView logs={fastingLogs} />
    </div>
  );
}
