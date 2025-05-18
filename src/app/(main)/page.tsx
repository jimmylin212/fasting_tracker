
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { FastingLog } from '@/lib/types';
import { format, formatDistanceStrict, addHours, isAfter, isBefore, isValid, differenceInHours } from 'date-fns';
import { Hourglass, PlayCircle, StopCircle, CalendarDays, Edit3, Zap, Brain, Recycle, ShieldHalf, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';

interface FastingStage {
  name: string;
  minHours: number;
  maxHours?: number;
  description: string;
  icon?: React.ElementType;
  details: string[];
}

const fastingStages: FastingStage[] = [
  {
    name: "Glucose Burning",
    minHours: 0,
    maxHours: 12,
    icon: Zap,
    description: "Body using up last meal's glucose.",
    details: [
      "Blood sugar rises, then falls.",
      "Insulin guides glucose into cells.",
      "Stored glycogen starts to deplete."
    ]
  },
  {
    name: "Early Fat Burning & Ketosis",
    minHours: 12,
    maxHours: 18,
    icon: Zap,
    description: "Glycogen low, fat breakdown (lipolysis) begins.",
    details: [
      "Ketone production may start.",
      "Autophagy (cellular cleanup) processes initiate."
    ]
  },
  {
    name: "Deeper Ketosis & Autophagy",
    minHours: 18,
    maxHours: 24,
    icon: Brain,
    description: "Ketones rise, fueling brain. Autophagy active.",
    details: [
      "Increased mental clarity for some.",
      "Cellular repair processes become more pronounced."
    ]
  },
  {
    name: "Autophagy Peak & Growth Hormone",
    minHours: 24,
    maxHours: 36,
    icon: Recycle,
    description: "Cellular cleanup peaks. Growth hormone may rise.",
    details: [
      "Growth hormone helps preserve muscle.",
      "Enhanced fat burning."
    ]
  },
  {
    name: "Insulin Sensitivity & Inflammation Reduction",
    minHours: 36,
    maxHours: 48,
    icon: Leaf,
    description: "Insulin sensitivity improves. Anti-inflammatory effects.",
    details: [
      "Better blood sugar control.",
      "Cellular stress resistance may increase."
    ]
  },
  {
    name: "Immune Cell Rejuvenation (Potential)",
    minHours: 48,
    maxHours: 72,
    icon: ShieldHalf,
    description: "Potential for immune cell turnover.",
    details: [
      "Breakdown of old immune cells.",
      "Stimulation of new immune cell generation (varies)."
    ]
  },
  {
    name: "Sustained Benefits (Medical Supervision Recommended)",
    minHours: 72,
    icon: ShieldHalf,
    description: "Longer fasts require medical guidance.",
    details: [
      "Significant metabolic changes.",
      "Careful refeeding is critical."
    ]
  }
];

const getCurrentFastingStage = (elapsedHours: number): FastingStage | null => {
  for (let i = fastingStages.length - 1; i >= 0; i--) {
    const stage = fastingStages[i];
    if (elapsedHours >= stage.minHours) {
      if (stage.maxHours === undefined || elapsedHours < stage.maxHours) {
        return stage;
      }
    }
  }
  // If elapsedHours is greater than the last defined maxHours, return the last stage
  if (elapsedHours >= fastingStages[fastingStages.length - 1].minHours && fastingStages[fastingStages.length-1].maxHours === undefined) {
      return fastingStages[fastingStages.length - 1];
  }
  return fastingStages[0]; // Default to first stage if something is off, though logic above should cover.
};


export default function HomePage() {
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [currentFast, setCurrentFast] = useState<FastingLog | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("0 seconds");
  const [elapsedHours, setElapsedHours] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<FastingStage | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedLogs = localStorage.getItem('fastingLogs');
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs, (key, value) => {
            if (key === 'startTime' || key === 'endTime') {
              const date = new Date(value);
              return isValid(date) ? date : null;
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

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('fastingLogs', JSON.stringify(fastingLogs));
    }
  }, [fastingLogs, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const now = new Date();
    const activeFast = fastingLogs.find(log => {
      if (!log.startTime || !log.endTime) return false;
      const startTime = log.startTime as Date;
      const endTime = log.endTime as Date;
      return isBefore(startTime, now) && isAfter(endTime, now);
    });
    
    setCurrentFast(activeFast || null);

  }, [fastingLogs, isClient]); 

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (currentFast && currentFast.startTime && isClient) {
      const updateTimers = () => {
        const now = new Date();
        if (currentFast.endTime && isBefore(currentFast.endTime as Date, now)) {
          setCurrentFast(null); 
          setElapsedTime("0 seconds");
          setElapsedHours(0);
          setCurrentStage(null);
        } else if (currentFast.startTime) {
          setElapsedTime(formatDistanceStrict(now, currentFast.startTime as Date, { addSuffix: false }));
          const hours = differenceInHours(now, currentFast.startTime as Date);
          setElapsedHours(hours);
          setCurrentStage(getCurrentFastingStage(hours));
        }
      };
      updateTimers(); 
      interval = setInterval(updateTimers, 1000); // Update every second for elapsed time
    } else {
      setElapsedTime("0 seconds");
      setElapsedHours(0);
      setCurrentStage(null);
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
      endTime: addHours(now, 16), 
      notes: "Started from home page",
    };
    setFastingLogs(prevLogs => {
        const updatedLogs = [newFast, ...prevLogs].sort((a,b) => (b.startTime as Date).getTime() - (a.startTime as Date).getTime());
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
            <Skeleton className="h-10 w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <Card className="shadow-xl max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Fasting Status</CardTitle>
          <CardDescription>Your current fasting progress and estimated stage.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {currentFast ? (
            <>
              {currentStage && currentStage.icon ? (
                <currentStage.icon className="h-16 w-16 mx-auto text-primary" />
              ) : (
                <Hourglass className="h-16 w-16 mx-auto text-primary" />
              )}
              <p className="text-xl font-semibold">Currently Fasting!</p>
              <p className="text-lg">
                Duration: <span className="font-medium text-primary">{elapsedTime}</span>
              </p>
              {currentStage && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-left">
                  <p className="text-md font-semibold text-primary">Current Stage: {currentStage.name} ({currentStage.minHours}{currentStage.maxHours ? `-${currentStage.maxHours}` : '+'} hrs)</p>
                  <p className="text-sm text-muted-foreground mt-1">{currentStage.description}</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                    {currentStage.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Started: {currentFast.startTime ? format(currentFast.startTime as Date, "MMM d, yyyy 'at' HH:mm") : 'N/A'}
              </p>
              {currentFast.endTime && (
                <p className="text-xs text-muted-foreground">
                  Planned End: {format(currentFast.endTime as Date, "MMM d, yyyy 'at' HH:mm")}
                </p>
              )}
              <Button onClick={handleEndFastNow} variant="destructive" className="w-full">
                <StopCircle className="mr-2 h-5 w-5" /> End Fast Now
              </Button>
              <Button variant="secondary" className="w-full mt-2" asChild>
                <Link href="/fasting">
                  <Edit3 className="mr-2 h-5 w-5" /> Edit Current Fast / View Logs
                </Link>
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
              <CalendarDays className="mr-2 h-5 w-5" /> View All Fasting Logs & Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>

      {isClient && ( // Only render disclaimer on client
        <Alert variant="default" className="max-w-lg mx-auto mt-6 text-sm">
          <Info className="h-4 w-4" />
          <AlertTitle className="font-semibold">Fasting Information Disclaimer</AlertTitle>
          <AlertDescription>
            Fasting stage information is based on general estimates and can vary greatly per individual. 
            This is for informational and motivational purposes only, not medical advice. 
            Always consult with a healthcare professional before making significant changes to your diet or starting a fasting regimen, 
            especially if you have any underlying health conditions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

