import { QueueData } from '../../shared/types/queue.js';
import { SensorSummary, IoTSystemHealth } from '../iot-data/iot-data.types.js';

export interface DashboardOverview {
  queueStatus: QueueData | null;
  systemHealth: IoTSystemHealth;
  recentAlerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;
  keyMetrics: {
    totalPatientsToday: number;
    averageWaitTime: number;
    peakHourToday: {
      hour: number;
      patientCount: number;
    } | null;
    systemUptime: number; // percentage
  };
}

export interface RealTimeData {
  timestamp: Date;
  queueLength: number;
  waitTime: number;
  roomOccupancy: number;
  staffAvailable: number;
  activeSensors: number;
}

export interface DashboardConfig {
  refreshInterval: number;
  alertThresholds: {
    highVolume: number;
    longWait: number;
    lowOccupancy: number;
  };
}
