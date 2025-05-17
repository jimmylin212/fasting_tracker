
import type { Timestamp } from 'firebase/firestore';

export interface FastingLog {
  id: string; // Firestore document ID
  startTime: Date | Timestamp; // Store as Date in app, Timestamp in Firestore
  endTime: Date | Timestamp;   // Store as Date in app, Timestamp in Firestore
  notes?: string;
  userId?: string; // To associate with a user
}

export interface WeightLog {
  id: string; // Firestore document ID
  date: Date | Timestamp; // Store as Date in app, Timestamp in Firestore
  weight: number; // in kg or lbs, user context dependent
  userId?: string;
}

export interface FatLog {
  id: string; // Firestore document ID
  date: Date | Timestamp; // Store as Date in app, Timestamp in Firestore
  fatPercentage: number; // as a percentage value
  userId?: string;
}

export interface WorkoutLog {
  id: string; // Firestore document ID
  date: Date | Timestamp; // Store as Date in app, Timestamp in Firestore
  workoutType: string;
  weight: number; // KG
  reps: number;
  sets: number;
  userId?: string;
}
