
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AddStepLogForm } from '@/components/steps/add-step-log-form';
import { StepLogList } from '@/components/steps/step-log-list';
import { StepsChart } from '@/components/steps/steps-chart';
import type { StepLog, UserProfile } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const STEPS_LOG_KEY = 'stepLogs';
const USER_PROFILE_KEY = 'userProfile';
const CALORIE_BURN_FACTOR_PER_STEP_PER_KG = 0.0006; // Very rough estimate

export default function StepsPage() {
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedLogs = localStorage.getItem(STEPS_LOG_KEY);
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs, (key, value) => {
            if (key === 'date') return new Date(value);
            return value;
          }) as StepLog[];
          setStepLogs(parsedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
          console.error("Error parsing step logs from localStorage", error);
          setStepLogs([]);
        }
      }

      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        try {
          setUserProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.error("Error parsing user profile from localStorage", error);
          setUserProfile(null);
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STEPS_LOG_KEY, JSON.stringify(stepLogs));
    }
  }, [stepLogs, isClient]);

  const handleAddLog = useCallback((newLogData: Omit<StepLog, 'id' | 'caloriesBurned'>) => {
    let caloriesBurned: number | undefined = undefined;
    if (userProfile?.weight && newLogData.steps > 0) {
      caloriesBurned = Math.round(newLogData.steps * userProfile.weight * CALORIE_BURN_FACTOR_PER_STEP_PER_KG);
    }

    const newLog: StepLog = {
      ...newLogData,
      id: Date.now().toString(),
      caloriesBurned,
    };

    setStepLogs(prevLogs =>
      [newLog, ...prevLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, [userProfile]);

  if (!isClient) {
    return (
      <div className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">Daily Steps Tracker</CardTitle>
            <CardDescription>Log your daily steps and see estimated calories burned.</CardDescription>
          </CardHeader>
        </Card>
        <Skeleton className="h-48 w-full" /> {/* Skeleton for form */}
        <Skeleton className="h-72 w-full" /> {/* Skeleton for chart */}
        <Skeleton className="h-96 w-full" /> {/* Skeleton for list */}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Daily Steps Tracker</CardTitle>
          <CardDescription>Log your daily steps and see estimated calories burned based on your profile weight.</CardDescription>
        </CardHeader>
      </Card>

      <AddStepLogForm onAddLog={handleAddLog} />

      <Alert variant="default" className="text-sm">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-semibold">Calorie Estimation Disclaimer</AlertTitle>
        <AlertDescription>
          Calories burned are a rough estimate based on steps and your weight (if provided in your profile).
          Actual calories burned can vary significantly based on intensity, terrain, individual metabolism, and other factors.
          This feature is for informational purposes only.
        </AlertDescription>
      </Alert>
      
      {stepLogs.length > 0 ? (
        <>
          <StepsChart logs={stepLogs} />
          <StepLogList logs={stepLogs} />
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No step data logged yet. Add your first entry!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
