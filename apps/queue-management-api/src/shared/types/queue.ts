import type { BaseEntity } from './common.js';

export interface QueueData extends BaseEntity {
  timestamp: Date;
  totalPatients: number;
  waitingPatients: number;
  averageWaitTime: number;
  triage: {
    critical: number;
    urgent: number;
    standard: number;
  };
  roomOccupancy: {
    total: number;
    occupied: number;
    available: number;
  };
}

export interface QueueAnalytics {
  peakHours: Array<{
    hour: number;
    averagePatients: number;
  }>;
  averageDailyVolume: number;
  bottlenecks: Array<{
    type: 'staffing' | 'rooms' | 'equipment';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  trends: {
    weeklyGrowth: number;
    seasonalPattern: string;
  };
}

export interface QueueAlert {
  id: string;
  type: 'high_volume' | 'long_wait' | 'critical_patient' | 'staff_shortage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}
