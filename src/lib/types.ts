export interface FastingLog {
  id: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: Date;
  weight: number; // in kg or lbs, user context dependent
}

export interface FatLog {
  id: string;
  date: Date;
  fatPercentage: number; // as a percentage value
}
