import { IDataRepository } from '../../shared/repositories/repository.interface.js';
import { SensorReading, SensorHealth } from '../../shared/types/sensor.js';
import { TimeRange } from '../../shared/types/common.js';
import { generateId, getTimeRangeForHours } from '../../shared/utils/date-helpers.js';

export class IoTDataRepository {
  constructor(private dataRepository: IDataRepository) {}

  async saveSensorReading(reading: Omit<SensorReading, 'id' | 'createdAt' | 'updatedAt'>): Promise<SensorReading> {
    const fullReading: SensorReading = {
      ...reading,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.dataRepository.saveSensorReading(fullReading);
    return fullReading;
  }

  async getSensorReadings(sensorType: string, timeRange: TimeRange): Promise<SensorReading[]> {
    return this.dataRepository.getSensorReadings(sensorType, timeRange);
  }

  async getLatestSensorReading(sensorId: string): Promise<SensorReading | null> {
    return this.dataRepository.getLatestSensorReading(sensorId);
  }

  async getSensorHealth(): Promise<SensorHealth[]> {
    return this.dataRepository.getSensorHealth();
  }

  async getRecentReadingsForSensor(sensorId: string, hours: number = 1): Promise<SensorReading[]> {
    const timeRange = getTimeRangeForHours(hours);
    const allReadings = await this.dataRepository.getSensorReadings('', timeRange); // Get all types
    
    return allReadings
      .filter(reading => reading.sensorId === sensorId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getSensorReadingsByType(sensorType: string, hours: number = 24): Promise<SensorReading[]> {
    const timeRange = getTimeRangeForHours(hours);
    return this.getSensorReadings(sensorType, timeRange);
  }
}
