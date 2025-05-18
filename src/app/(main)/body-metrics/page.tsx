
"use client";

import React, { useState, useEffect } from 'react';
import { AddBodyMetricsForm } from '@/components/body-metrics/add-body-metrics-form';
import { BodyMetricsChart } from '@/components/body-metrics/body-metrics-chart';
import type { BodyMetricsLog } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const initialLogs: BodyMetricsLog[] = [];

export default function BodyMetricsPage() {
  const [bodyMetricsLogs, setBodyMetricsLogs] = useState<BodyMetricsLog[]>(initialLogs);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedLogs = localStorage.getItem('bodyMetricsLogs');
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs, (key, value) => {
            if (key === 'date') return new Date(value);
            return value;
          }) as BodyMetricsLog[];
          setBodyMetricsLogs(parsedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        } catch (error) {
          console.error("Error parsing body metrics logs from localStorage", error);
          setBodyMetricsLogs([]);
        }
      } else {
        // For demonstration, pre-fill with some mock data if localStorage is empty
        // In a real app, you might not want this or handle migration from old 'weightLogs' and 'fatLogs'
        const mockLogs: BodyMetricsLog[] = [
            { id: 'bm1', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), weight: 75.0, fatPercentage: 15.8, skeletalMuscleMassPercentage: 35.2 },
            { id: 'bm2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), weight: 75.5, fatPercentage: 15.5, skeletalMuscleMassPercentage: 35.5 },
            { id: 'bm3', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), weight: 75.0, fatPercentage: 15.2, skeletalMuscleMassPercentage: 35.8 },
            { id: 'bm4', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), weight: 74.8, fatPercentage: 15.0, skeletalMuscleMassPercentage: 36.0 },
        ];
        setBodyMetricsLogs(mockLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    }
  }, [isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('bodyMetricsLogs', JSON.stringify(bodyMetricsLogs));
    }
  }, [bodyMetricsLogs, isClient]);

  const handleAddLog = (newLogData: Omit<BodyMetricsLog, 'id'>) => {
    const newLog: BodyMetricsLog = {
      ...newLogData,
      id: Date.now().toString(), // Simple ID generation
    };
    setBodyMetricsLogs(prevLogs => 
      [...prevLogs, newLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  if (!isClient && bodyMetricsLogs.length === 0) {
    return (
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">Body Metrics Tracker</CardTitle>
            <CardDescription>Log your weight, body fat, and skeletal muscle mass.</CardDescription>
          </CardHeader>
        </Card>
        <Skeleton className="h-72 w-full" /> {/* Skeleton for form */}
        <Skeleton className="h-96 w-full" /> {/* Skeleton for chart */}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Body Metrics Tracker</CardTitle>
          <CardDescription>Log your weight, body fat percentage, and skeletal muscle mass percentage to see your progress.</CardDescription>
        </CardHeader>
      </Card>

      <AddBodyMetricsForm onAddLog={handleAddLog} />
      {isClient && bodyMetricsLogs.length === 0 && <p className="text-center text-muted-foreground">No body metrics logged yet. Add an entry to get started!</p>}
      <BodyMetricsChart logs={bodyMetricsLogs} />
    </div>
  );
}
