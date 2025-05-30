import { QueueData, QueueAnalytics, QueueAlert } from '../../shared/types/queue.js';

export interface QueueStatusTypes {
  QueueData: QueueData;
  QueueAnalytics: QueueAnalytics;
  QueueAlert: QueueAlert;
}

export interface CreateQueueDataRequest {
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
  timestamp?: Date; // Optional custom timestamp for historical data generation
}

export interface QueueStatusResponse {
  current: QueueData;
  trends: {
    hourlyChange: number;
    dailyAverage: number;
  };
  alerts: QueueAlert[];
}
