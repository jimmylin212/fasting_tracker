
export interface FastingLog {
  id: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

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

export interface UserProfile {
  age?: number;
  height?: number; // cm
  weight?: number; // kg (for BMR calculation)
  sex?: 'male' | 'female';
  bmr?: number;
}

export interface StepLog {
  id: string;
  date: Date;
  steps: number;
  caloriesBurned?: number;
}
