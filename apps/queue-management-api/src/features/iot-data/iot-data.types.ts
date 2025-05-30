import { SensorReading, SensorHealth, SensorConfig } from '../../shared/types/sensor.js';

export interface IoTDataTypes {
  SensorReading: SensorReading;
  SensorHealth: SensorHealth;
  SensorConfig: SensorConfig;
}

export interface ProcessSensorReadingRequest {
  sensorId: string;
  sensorType: 'arrival' | 'wait-time' | 'occupancy' | 'staff';
  value: number;
  metadata?: Record<string, any>;
  locationId?: string;
}

export interface SensorSummary {
  sensorId: string;
  sensorType: string;
  status: 'online' | 'offline' | 'error';
  lastReading: Date;
  location?: string;
  recentValues: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface IoTSystemHealth {
  totalSensors: number;
  onlineSensors: number;
  offlineSensors: number;
  errorSensors: number;
  lastDataUpdate: Date;
  dataQuality: 'good' | 'degraded' | 'poor';
}
