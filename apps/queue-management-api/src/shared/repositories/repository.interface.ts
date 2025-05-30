import type { QueueData } from '../types/queue.js';
import type { SensorReading, SensorHealth } from '../types/sensor.js';
import type { Prediction } from '../types/prediction.js';
import type { TimeRange } from '../types/common.js';

export interface IDataRepository {
  // Queue Data Operations
  saveQueueData(queueData: QueueData): Promise<void>;
  getQueueDataByTimeRange(timeRange: TimeRange): Promise<QueueData[]>;
  getLatestQueueData(): Promise<QueueData | null>;
  getHistoricalData(hours: number): Promise<QueueData[]>;
  
  // Sensor Data Operations
  saveSensorReading(sensorReading: SensorReading): Promise<void>;
  getSensorReadings(sensorType: string, timeRange: TimeRange): Promise<SensorReading[]>;
  getLatestSensorReading(sensorId: string): Promise<SensorReading | null>;
  getSensorHealth(): Promise<SensorHealth[]>;
  
  // Prediction Operations
  savePrediction(prediction: Prediction): Promise<void>;
  getPredictions(type: string, timeRange: TimeRange): Promise<Prediction[]>;
  getLatestPredictions(type: string, limit: number): Promise<Prediction[]>;
  
  // Health Operations
  getSystemHealth(): Promise<{ 
    totalSensors: number; 
    activeSensors: number; 
    lastDataUpdate: Date; 
  }>;
}
