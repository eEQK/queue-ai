import { CURRENT_HOUR_READINGS, SensorData, SensorType, SENSOR_TYPES } from './current-hour-readings';

export class ReadingGenerator {
  private currentIndexes: Map<SensorType, number> = new Map();
  
  constructor() {
    // Initialize all sensor types with index 0
    SENSOR_TYPES.forEach(sensorType => {
      this.currentIndexes.set(sensorType, 0);
    });
  }
  
  /**
   * Get the next reading for a specific sensor type
   * Returns null if no more readings available for current hour
   */
  getNextReading(sensorType: SensorType): SensorData | null {
    const readings = CURRENT_HOUR_READINGS[sensorType];
    const currentIndex = this.currentIndexes.get(sensorType) || 0;
    
    if (!readings || currentIndex >= readings.length) {
      return null; // No more readings for current hour
    }
    
    const reading = readings[currentIndex];
    
    // Increment index for next call
    this.currentIndexes.set(sensorType, currentIndex + 1);
    
    // Transform to SensorData format
    return {
      sensorId: `${sensorType}-sensor-001`,
      sensorType,
      timestamp: reading.timestamp,
      value: reading.value,
      metadata: {
        readingIndex: currentIndex,
        totalReadings: readings.length,
        hasMoreReadings: currentIndex + 1 < readings.length
      }
    };
  }
  
  /**
   * Reset all reading indexes to beginning of current hour
   */
  reset(): void {
    SENSOR_TYPES.forEach(sensorType => {
      this.currentIndexes.set(sensorType, 0);
    });
  }
  
  /**
   * Get status of all sensors (current index and total readings available)
   */
  getStatus(): Record<SensorType, { currentIndex: number; totalReadings: number; hasMoreReadings: boolean }> {
    const status = {} as Record<SensorType, { currentIndex: number; totalReadings: number; hasMoreReadings: boolean }>;
    
    SENSOR_TYPES.forEach(sensorType => {
      const currentIndex = this.currentIndexes.get(sensorType) || 0;
      const totalReadings = CURRENT_HOUR_READINGS[sensorType]?.length || 0;
      
      status[sensorType] = {
        currentIndex,
        totalReadings,
        hasMoreReadings: currentIndex < totalReadings
      };
    });
    
    return status;
  }
  
  /**
   * Check if a sensor type is valid
   */
  isValidSensorType(sensorType: string): sensorType is SensorType {
    return SENSOR_TYPES.includes(sensorType as SensorType);
  }
}
