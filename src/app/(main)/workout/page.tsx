
"use client";

import React, { useState, useEffect } from 'react';
import { AddWorkoutLogForm } from '@/components/workout/add-workout-log-form';
import { WorkoutLogList } from '@/components/workout/workout-list';
import type { WorkoutLog } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const initialLogs: WorkoutLog[] = [];

export default function WorkoutPage() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedLogs = localStorage.getItem('workoutLogs');
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs, (key, value) => {
          if (key === 'date') {
            return new Date(value);
          }
          return value;
        }) as WorkoutLog[];
        setWorkoutLogs(parsedLogs.sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch (error) {
        console.error("Failed to parse workout logs from localStorage", error);
        setWorkoutLogs(initialLogs.sort((a, b) => b.date.getTime() - a.date.getTime()));
      }
    } else {
      setWorkoutLogs(initialLogs.sort((a, b) => b.date.getTime() - a.date.getTime()));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
    }
  }, [workoutLogs, isClient]);

  const handleAddLog = (newLogData: Omit<WorkoutLog, 'id'>) => {
    const newLog: WorkoutLog = {
      ...newLogData,
      id: Date.now().toString(),
    };
    setWorkoutLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      return updatedLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
    });
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>Loading tracker...</p></div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Workout Tracker</CardTitle>
          <CardDescription>Log your workouts and track your progress.</CardDescription>
        </CardHeader>
      </Card>
      
      <AddWorkoutLogForm onAddLog={handleAddLog} />
      <WorkoutLogList logs={workoutLogs} />
    </div>
  );
}
