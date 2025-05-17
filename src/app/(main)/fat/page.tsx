"use client";

import React, { useState, useEffect } from 'react';
import { AddFatLogForm } from '@/components/fat/add-fat-log-form';
import { FatChart } from '@/components/fat/fat-chart';
import type { FatLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock initial data
const initialLogs: FatLog[] = [
  { id: 'f1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), fatPercentage: 15.5 },
  { id: 'f2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), fatPercentage: 15.2 },
  { id: 'f3', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), fatPercentage: 15.0 },
];


export default function FatPage() {
  const [fatLogs, setFatLogs] = useState<FatLog[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedLogs = localStorage.getItem('fatLogs');
    if (storedLogs) {
      setFatLogs(JSON.parse(storedLogs, (key, value) => {
        if (key === 'date') {
          return new Date(value);
        }
        return value;
      }));
    } else {
      setFatLogs(initialLogs);
    }
  }, []);
  
  useEffect(() => {
    if(isClient) {
      localStorage.setItem('fatLogs', JSON.stringify(fatLogs));
    }
  }, [fatLogs, isClient]);


  const handleAddLog = (newLogData: Omit<FatLog, 'id'>) => {
    const newLog: FatLog = {
      ...newLogData,
      id: Date.now().toString(),
    };
    setFatLogs(prevLogs => [...prevLogs, newLog].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><p>Loading tracker...</p></div>; 
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Body Fat Tracker</CardTitle>
          <CardDescription>Log your body fat percentage and visualize your progress on the chart.</CardDescription>
        </CardHeader>
      </Card>

      <AddFatLogForm onAddLog={handleAddLog} />
      <FatChart logs={fatLogs} />
    </div>
  );
}
