
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AddWorkoutLogForm } from '@/components/workout/add-workout-log-form';
import { WorkoutLogList } from '@/components/workout/workout-list';
import type { WorkoutLog } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutTrendChart } from '@/components/workout/workout-trend-chart';

const initialLogs: WorkoutLog[] = [];

export default function WorkoutPage() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedWorkoutTypeForTrend, setSelectedWorkoutTypeForTrend] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if(isClient) {
      const storedLogs = localStorage.getItem('workoutLogs');
      let parsedLogs: WorkoutLog[] = initialLogs;
      if (storedLogs) {
        try {
          parsedLogs = JSON.parse(storedLogs, (key, value) => {
            if (key === 'date') {
              return new Date(value);
            }
            return value;
          }) as WorkoutLog[];
        } catch (error) {
          console.error("Failed to parse workout logs from localStorage", error);
          // parsedLogs remains initialLogs
        }
      }
      
      const sortedLogs = parsedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setWorkoutLogs(sortedLogs);

      if (!selectedWorkoutTypeForTrend && sortedLogs.length > 0) {
        const uniqueTypes = Array.from(new Set(sortedLogs.map(log => log.workoutType).filter(Boolean)));
        if (uniqueTypes.length > 0) {
            const mostRecentLogWithWorkoutType = sortedLogs.find(log => log.workoutType);
            if(mostRecentLogWithWorkoutType) {
                setSelectedWorkoutTypeForTrend(mostRecentLogWithWorkoutType.workoutType);
            } else { 
                 setSelectedWorkoutTypeForTrend(uniqueTypes[0]);
            }
        }
      }
    }
  }, [isClient]); // selectedWorkoutTypeForTrend removed from deps to avoid loop, it's set here or by user

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
      const sorted = updatedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // If this is the first log of a new type, or no trend is selected, select it.
      if (!selectedWorkoutTypeForTrend || !uniqueWorkoutTypes.includes(newLog.workoutType)) {
        setSelectedWorkoutTypeForTrend(newLog.workoutType);
      }
      return sorted;
    });
  };

  const uniqueWorkoutTypes = useMemo(() => {
    return Array.from(new Set(workoutLogs.map(log => log.workoutType).filter(Boolean))).sort();
  }, [workoutLogs]);

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>Loading tracker...</p></div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Workout Tracker</CardTitle>
          <CardDescription>Log your workouts, track your progress, and view trends.</CardDescription>
        </CardHeader>
      </Card>
      
      <AddWorkoutLogForm onAddLog={handleAddLog} />
      
      {uniqueWorkoutTypes.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Workout Progression</CardTitle>
            <CardDescription>Select a workout type to see how your weight lifted has progressed over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedWorkoutTypeForTrend || ""}
              onValueChange={(value) => setSelectedWorkoutTypeForTrend(value || null)}
            >
              <SelectTrigger className="w-full md:w-[300px] mb-6">
                <SelectValue placeholder="Select a workout type to see trend" />
              </SelectTrigger>
              <SelectContent>
                {uniqueWorkoutTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedWorkoutTypeForTrend && workoutLogs.filter(log => log.workoutType === selectedWorkoutTypeForTrend).length > 0 ? (
              <WorkoutTrendChart logs={workoutLogs} selectedWorkoutType={selectedWorkoutTypeForTrend} />
            ) : selectedWorkoutTypeForTrend ? (
                 <p className="text-muted-foreground text-center py-4">No data yet for {selectedWorkoutTypeForTrend}.</p>
            ) : (
                 <p className="text-muted-foreground text-center py-4">Please select a workout type to view its trend.</p>
            )}
          </CardContent>
        </Card>
      )}
      
      <WorkoutLogList logs={workoutLogs} />
    </div>
  );
}
