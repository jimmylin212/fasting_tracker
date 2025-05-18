
export interface FastingLog {
  id: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

// Removed old WeightLog and FatLog interfaces

export interface BodyMetricsLog {
  id: string;
  date: Date;
  weight: number; // in kg
  fatPercentage?: number; // as a percentage value
  skeletalMuscleMassPercentage?: number; // as a percentage value
}

export interface WorkoutLog {
  id: string;
  date: Date;
  workoutType: string;
  weight: number; // KG
  reps: number;
  sets: number;
}
