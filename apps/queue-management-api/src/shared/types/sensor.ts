import type { BaseEntity } from './common.js';

export interface SensorReading extends BaseEntity {
  sensorId: string;
  sensorType: 'arrival' | 'wait-time' | 'occupancy' | 'staff';
  timestamp: Date;
  value: number;
  metadata: Record<string, any>;
  locationId?: string;
}

export interface SensorHealth {
  sensorId: string;
  sensorType: string;
  status: 'online' | 'offline' | 'error';
  lastReading: Date;
  batteryLevel?: number;
  signalStrength?: number;
  errorCount: number;
  location?: string;
}

export interface SensorConfig {
  sensorId: string;
  sensorType: string;
  location: string;
  reportingInterval: number; // seconds
  enabled: boolean;
  calibrationOffset?: number;
  alertThresholds?: {
    min?: number;
    max?: number;
  };
}
