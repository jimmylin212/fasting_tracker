
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AddWorkoutLogForm } from '@/components/workout/add-workout-log-form';
import { WorkoutLogList } from '@/components/workout/workout-list';
import type { WorkoutLog } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutTrendChart } from '@/components/workout/workout-trend-chart';
import { Skeleton } from '@/components/ui/skeleton';

const initialLogs: WorkoutLog[] = [];

export default function WorkoutPage() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedWorkoutTypeForTrend, setSelectedWorkoutTypeForTrend] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null); // State for the log being edited

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
  }, [isClient]); // Removed selectedWorkoutTypeForTrend from here, it will be derived

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
    }
  }, [workoutLogs, isClient]);

  const handleSaveLog = (logData: Omit<WorkoutLog, "id"> | WorkoutLog) => {
    setWorkoutLogs(prevLogs => {
      let updatedLogs;
      if ('id' in logData && editingLog && logData.id === editingLog.id) { // Check if it's an update
        updatedLogs = prevLogs.map(log => 
          log.id === logData.id ? { ...log, ...logData, date: new Date(logData.date) } : log // Ensure date is Date object
        );
      } else { // It's a new log
        const newLog: WorkoutLog = {
          ...(logData as Omit<WorkoutLog, "id">), 
          id: Date.now().toString(),
          date: new Date(logData.date), // Ensure date is Date object
        };
        updatedLogs = [newLog, ...prevLogs];
      }
      
      const sorted = updatedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Update selectedWorkoutTypeForTrend if the new/edited log's type makes sense to select
      const currentUniqueTypes = Array.from(new Set(sorted.map(log => log.workoutType).filter(Boolean)));
      if (logData.workoutType && (!selectedWorkoutTypeForTrend || !currentUniqueTypes.includes(selectedWorkoutTypeForTrend))) {
        setSelectedWorkoutTypeForTrend(logData.workoutType);
      } else if (!logData.workoutType && selectedWorkoutTypeForTrend && !currentUniqueTypes.includes(selectedWorkoutTypeForTrend) && currentUniqueTypes.length > 0) {
        // If current selection is removed and others exist, pick the first available
        setSelectedWorkoutTypeForTrend(currentUniqueTypes[0]);
      } else if (currentUniqueTypes.length === 0) {
        setSelectedWorkoutTypeForTrend(null);
      }
      
      setEditingLog(null); // Clear editing state
      return sorted;
    });
  };

  const handleEditRequest = (log: WorkoutLog) => {
    setEditingLog(log);
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
  };

  const uniqueWorkoutTypes = useMemo(() => {
    return Array.from(new Set(workoutLogs.map(log => log.workoutType).filter(Boolean))).sort();
  }, [workoutLogs]);

  // Effect to set initial selectedWorkoutTypeForTrend if it's null and uniqueWorkoutTypes is populated
  useEffect(() => {
    if (!selectedWorkoutTypeForTrend && uniqueWorkoutTypes.length > 0) {
      setSelectedWorkoutTypeForTrend(uniqueWorkoutTypes[0]);
    }
  }, [uniqueWorkoutTypes, selectedWorkoutTypeForTrend]);


  if (!isClient) {
    // Basic skeleton for initial loading
    return (
      <div className="space-y-8">
        <Card className="shadow-xl"><CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader></Card>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Workout Tracker</CardTitle>
          <CardDescription>Log your workouts, track your progress, and view trends. Edit entries by clicking the edit icon in the history.</CardDescription>
        </CardHeader>
      </Card>
      
      <AddWorkoutLogForm 
        onSaveLog={handleSaveLog} 
        logToEdit={editingLog} 
        onCancelEdit={handleCancelEdit}
        workoutTypeSuggestions={uniqueWorkoutTypes}
      />
      
      {uniqueWorkoutTypes.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Workout Progression</CardTitle>
            <CardDescription>Select a workout type to see how your total volume has progressed over time. You can also click on a workout type in the history below.</CardDescription>
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
                 <p className="text-muted-foreground text-center py-4">Please select a workout type or log an entry to view its trend.</p>
            )}
          </CardContent>
        </Card>
      )}
      
      <WorkoutLogList 
        logs={workoutLogs} 
        onWorkoutTypeSelect={setSelectedWorkoutTypeForTrend}
        onEditLogRequest={handleEditRequest} 
      />
    </div>
  );
}
