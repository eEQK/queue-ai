import { SensorReading } from '../types/sensor.js';
import { generateId } from '../utils/date-helpers.js';

export interface MockIoTClientConfig {
  baseUrl: string;
  timeout: number;
}

export class MockIoTClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: MockIoTClientConfig = {
    baseUrl: 'http://localhost:3001',
    timeout: 5000
  }) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  async getNextPatientArrival(): Promise<SensorReading | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/sensors/patient-arrivals/next`);
      
      if (response.status === 204) {
        return null; // No more data for current hour
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformToSensorReading(data, 'arrival');
    } catch (error) {
      console.error('Error fetching patient arrival data:', error);
      return null;
    }
  }

  async getNextWaitTime(): Promise<SensorReading | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/sensors/wait-times/next`);
      
      if (response.status === 204) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformToSensorReading(data, 'wait-time');
    } catch (error) {
      console.error('Error fetching wait time data:', error);
      return null;
    }
  }

  async getNextRoomOccupancy(): Promise<SensorReading | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/sensors/room-occupancy/next`);
      
      if (response.status === 204) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformToSensorReading(data, 'occupancy');
    } catch (error) {
      console.error('Error fetching room occupancy data:', error);
      return null;
    }
  }

  async getNextStaffAvailability(): Promise<SensorReading | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/sensors/staff-availability/next`);
      
      if (response.status === 204) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformToSensorReading(data, 'staff');
    } catch (error) {
      console.error('Error fetching staff availability data:', error);
      return null;
    }
  }

  async resetReadings(): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/sensors/reset`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('Mock IoT readings reset successfully');
    } catch (error) {
      console.error('Error resetting mock IoT readings:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Mock IoT API health check failed:', error);
      return false;
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private transformToSensorReading(data: any, sensorType: SensorReading['sensorType']): SensorReading {
    return {
      id: generateId(),
      sensorId: data.sensorId,
      sensorType,
      timestamp: new Date(data.timestamp),
      value: data.value,
      metadata: data.metadata || {},
      locationId: data.locationId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
