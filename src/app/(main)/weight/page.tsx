"use client";

import React, { useState, useEffect } from 'react';
import { AddWeightLogForm } from '@/components/weight/add-weight-log-form';
import { WeightChart } from '@/components/weight/weight-chart';
import type { WeightLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock initial data
const initialLogs: WeightLog[] = [
  { id: 'w1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), weight: 75.5 },
  { id: 'w2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), weight: 75.0 },
  { id: 'w3', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), weight: 74.8 },
];

export default function WeightPage() {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedLogs = localStorage.getItem('weightLogs');
    if (storedLogs) {
      setWeightLogs(JSON.parse(storedLogs, (key, value) => {
        if (key === 'date') {
          return new Date(value);
        }
        return value;
      }));
    } else {
      setWeightLogs(initialLogs);
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('weightLogs', JSON.stringify(weightLogs));
    }
  }, [weightLogs, isClient]);


  const handleAddLog = (newLogData: Omit<WeightLog, 'id'>) => {
    const newLog: WeightLog = {
      ...newLogData,
      id: Date.now().toString(),
    };
    setWeightLogs(prevLogs => [...prevLogs, newLog].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>Loading tracker...</p></div>; 
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Weight Tracker</CardTitle>
          <CardDescription>Log your daily weight and visualize your progress on the chart.</CardDescription>
        </CardHeader>
      </Card>
      
      <AddWeightLogForm onAddLog={handleAddLog} />
      <WeightChart logs={weightLogs} />
    </div>
  );
}
