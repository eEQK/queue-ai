import { IDataRepository } from './repository.interface.js';
import { QueueData } from '../types/queue.js';
import { SensorReading, SensorHealth } from '../types/sensor.js';
import { Prediction } from '../types/prediction.js';
import { TimeRange } from '../types/common.js';

export class InMemoryDataRepository implements IDataRepository {
  private queueData: QueueData[] = [];
  private sensorReadings: SensorReading[] = [];
  private predictions: Prediction[] = [];
  private sensorHealthMap: Map<string, SensorHealth> = new Map();

  // Queue Data Operations
  async saveQueueData(queueData: QueueData): Promise<void> {
    this.queueData.push({ ...queueData });
    // Keep only last 7 days of data
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.queueData = this.queueData.filter(data => data.timestamp >= sevenDaysAgo);
  }

  async getQueueDataByTimeRange(timeRange: TimeRange): Promise<QueueData[]> {
    return this.queueData.filter(data => 
      data.timestamp >= timeRange.start && data.timestamp <= timeRange.end
    );
  }

  async getLatestQueueData(): Promise<QueueData | null> {
    if (this.queueData.length === 0) return null;
    return this.queueData[this.queueData.length - 1] || null;
  }

  async getHistoricalData(hours: number): Promise<QueueData[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.queueData.filter(data => data.timestamp >= cutoffTime);
  }

  // Sensor Data Operations
  async saveSensorReading(sensorReading: SensorReading): Promise<void> {
    this.sensorReadings.push({ ...sensorReading });
    
    // Update sensor health
    this.updateSensorHealth(sensorReading);
    
    // Keep only last 24 hours of sensor data
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.sensorReadings = this.sensorReadings.filter(reading => 
      reading.timestamp >= twentyFourHoursAgo
    );
  }

  async getSensorReadings(sensorType: string, timeRange: TimeRange): Promise<SensorReading[]> {
    return this.sensorReadings.filter(reading => 
      reading.sensorType === sensorType &&
      reading.timestamp >= timeRange.start && 
      reading.timestamp <= timeRange.end
    );
  }

  async getLatestSensorReading(sensorId: string): Promise<SensorReading | null> {
    const readings = this.sensorReadings
      .filter(reading => reading.sensorId === sensorId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return readings.length > 0 ? (readings[0] || null) : null;
  }

  async getSensorHealth(): Promise<SensorHealth[]> {
    return Array.from(this.sensorHealthMap.values());
  }

  // Prediction Operations
  async savePrediction(prediction: Prediction): Promise<void> {
    this.predictions.push({ ...prediction });
    
    // Keep only last 24 hours of predictions
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.predictions = this.predictions.filter(pred => 
      pred.timestamp >= twentyFourHoursAgo
    );
  }

  async getPredictions(type: string, timeRange: TimeRange): Promise<Prediction[]> {
    return this.predictions.filter(pred => 
      pred.type === type &&
      pred.timestamp >= timeRange.start && 
      pred.timestamp <= timeRange.end
    );
  }

  async getLatestPredictions(type: string, limit: number): Promise<Prediction[]> {
    return this.predictions
      .filter(pred => pred.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Health Operations
  async getSystemHealth(): Promise<{ 
    totalSensors: number; 
    activeSensors: number; 
    lastDataUpdate: Date; 
  }> {
    const sensors = Array.from(this.sensorHealthMap.values());
    const activeSensors = sensors.filter(sensor => sensor.status === 'online').length;
    
    const latestReading = this.sensorReadings.length > 0 
      ? this.sensorReadings[this.sensorReadings.length - 1] 
      : null;
    
    return {
      totalSensors: sensors.length,
      activeSensors,
      lastDataUpdate: latestReading?.timestamp || new Date()
    };
  }

  // Private helper methods
  private updateSensorHealth(reading: SensorReading): void {
    const existing = this.sensorHealthMap.get(reading.sensorId);
    
    const health: SensorHealth = {
      sensorId: reading.sensorId,
      sensorType: reading.sensorType,
      status: 'online',
      lastReading: reading.timestamp,
      errorCount: existing?.errorCount || 0,
      location: reading.locationId
    };
    
    this.sensorHealthMap.set(reading.sensorId, health);
  }
}
