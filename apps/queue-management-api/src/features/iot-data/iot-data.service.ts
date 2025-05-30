import { IoTDataRepository } from './iot-data.repository.js';
import { SensorReading, SensorHealth } from '../../shared/types/sensor.js';
import { ProcessSensorReadingRequest, SensorSummary, IoTSystemHealth } from './iot-data.types.js';
import { QueueStatusService } from '../queue-status/queue-status.service.js';
import { MockIoTClient } from '../../shared/clients/mock-iot-client.js';

export class IoTDataService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private lastQueueUpdateTime = 0;
  private queueUpdateDebounceMs = 2000; // Prevent queue updates within 2 seconds of each other

  constructor(
    private iotDataRepository: IoTDataRepository,
    private queueStatusService: QueueStatusService,
    private mockIoTClient: MockIoTClient,
    private pollingIntervalMs: number = 30000
  ) {}

  async processSensorReading(request: ProcessSensorReadingRequest): Promise<SensorReading> {
    const reading = await this.iotDataRepository.saveSensorReading({
      sensorId: request.sensorId,
      sensorType: request.sensorType,
      timestamp: new Date(),
      value: request.value,
      metadata: request.metadata || {},
      locationId: request.locationId
    });

    // Update queue data based on sensor readings
    await this.updateQueueDataFromSensors();

    return reading;
  }

  async getSensorHealth(): Promise<SensorHealth[]> {
    return this.iotDataRepository.getSensorHealth();
  }

  async getSensorSummaries(): Promise<SensorSummary[]> {
    const healthData = await this.getSensorHealth();
    const summaries: SensorSummary[] = [];

    for (const health of healthData) {
      const recentReadings = await this.iotDataRepository.getRecentReadingsForSensor(health.sensorId, 1);
      
      summaries.push({
        sensorId: health.sensorId,
        sensorType: health.sensorType,
        status: health.status,
        lastReading: health.lastReading,
        location: health.location,
        recentValues: recentReadings.slice(0, 10).map(reading => ({
          timestamp: reading.timestamp,
          value: reading.value
        }))
      });
    }

    return summaries;
  }

  async getSystemHealth(): Promise<IoTSystemHealth> {
    const sensorHealth = await this.getSensorHealth();
    const onlineSensors = sensorHealth.filter(s => s.status === 'online').length;
    const offlineSensors = sensorHealth.filter(s => s.status === 'offline').length;
    const errorSensors = sensorHealth.filter(s => s.status === 'error').length;

    // Determine data quality
    let dataQuality: 'good' | 'degraded' | 'poor' = 'good';
    const totalSensors = sensorHealth.length;
    const onlinePercentage = totalSensors > 0 ? onlineSensors / totalSensors : 0;

    if (onlinePercentage < 0.5) {
      dataQuality = 'poor';
    } else if (onlinePercentage < 0.8) {
      dataQuality = 'degraded';
    }

    // Get last data update
    const lastDataUpdate = sensorHealth.length > 0 
      ? new Date(Math.max(...sensorHealth.map(s => s.lastReading.getTime())))
      : new Date();

    return {
      totalSensors,
      onlineSensors,
      offlineSensors,
      errorSensors,
      lastDataUpdate,
      dataQuality
    };
  }

  async getSensorReadingsByType(sensorType: string, hours: number = 24): Promise<SensorReading[]> {
    return this.iotDataRepository.getSensorReadingsByType(sensorType, hours);
  }

  // Start polling the mock IoT API for new sensor data
  async startPolling(): Promise<void> {
    if (this.isPolling) {
      console.log('IoT polling already started');
      return;
    }

    this.isPolling = true;

    console.log(`Starting IoT data polling every ${this.pollingIntervalMs}ms`);
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollMockIoTAPI();
      } catch (error) {
        console.error('Error polling mock IoT API:', error);
      }
    }, this.pollingIntervalMs);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('IoT data polling stopped');
    }
  }

  private async pollMockIoTAPI(): Promise<void> {
    try {
      // Check if mock API is healthy
      const isHealthy = await this.mockIoTClient.checkHealth();
      if (!isHealthy) {
        console.warn('Mock IoT API is not healthy, skipping polling cycle');
        return;
      }

      // Poll each sensor type
      const sensorTypes = [
        { method: () => this.mockIoTClient.getNextPatientArrival(), type: 'arrival' as const },
        { method: () => this.mockIoTClient.getNextWaitTime(), type: 'wait-time' as const },
        { method: () => this.mockIoTClient.getNextRoomOccupancy(), type: 'occupancy' as const },
        { method: () => this.mockIoTClient.getNextStaffAvailability(), type: 'staff' as const }
      ];

      for (const sensor of sensorTypes) {
        const reading = await sensor.method();
        if (reading) {
          await this.processSensorReading({
            sensorId: reading.sensorId,
            sensorType: reading.sensorType,
            value: reading.value,
            metadata: reading.metadata,
            locationId: reading.locationId
          });
          
          console.log(`Processed ${sensor.type} reading: ${reading.value}`);
        }
      }
    } catch (error) {
      console.error('Error in pollMockIoTAPI:', error);
    }
  }

  private async updateQueueDataFromSensors(): Promise<void> {
    try {
      // Debounce queue updates to prevent rapid-fire duplicates
      const now = Date.now();
      if (now - this.lastQueueUpdateTime < this.queueUpdateDebounceMs) {
        console.log('Skipping queue update due to debounce');
        return;
      }

      // Get recent sensor readings to calculate queue data
      const arrivals = await this.getSensorReadingsByType('arrival', 1);
      const waitTimes = await this.getSensorReadingsByType('wait-time', 1);
      const occupancy = await this.getSensorReadingsByType('occupancy', 1);
      const staff = await this.getSensorReadingsByType('staff', 1);

      // Calculate current queue metrics from sensor data
      const latestArrival = arrivals[arrivals.length - 1];
      const latestWaitTime = waitTimes[waitTimes.length - 1];
      const latestOccupancy = occupancy[occupancy.length - 1];
      const latestStaff = staff[staff.length - 1];

      if (!latestArrival || !latestWaitTime || !latestOccupancy) {
        console.log('Insufficient sensor data for queue update');
        return; // Not enough data to calculate queue metrics
      }

      // Get current queue status to maintain realistic progression
      const currentStatus = await this.queueStatusService.getCurrentStatus();
      const currentTotal = currentStatus?.totalPatients || 10;
      
      // Calculate realistic changes based on sensor readings
      // Instead of summing ALL arrivals, use recent activity rate
      const recentArrivals = arrivals.slice(-3); // Last 3 arrival readings
      const avgArrivalRate = recentArrivals.length > 0 
        ? recentArrivals.reduce((sum, reading) => sum + reading.value, 0) / recentArrivals.length 
        : 1;
      
      // Realistic queue evolution: start from current + small changes
      const arrivalDelta = Math.floor((avgArrivalRate - 2) * 0.5); // Small adjustment based on arrival rate
      const totalPatients = Math.max(5, Math.min(30, currentTotal + arrivalDelta)); // Keep realistic bounds
      
      const averageWaitTime = latestWaitTime.value;
      const roomOccupied = Math.min(latestOccupancy.value, totalPatients); // Can't exceed total patients
      const totalRooms = 20; // Hardcoded for now
      const staffAvailable = latestStaff?.value || 8;

      // Estimate triage distribution (simplified)
      const critical = Math.floor(totalPatients * 0.1);
      const urgent = Math.floor(totalPatients * 0.3);
      const standard = totalPatients - critical - urgent;

      console.log(`Incremental queue update: ${currentTotal} -> ${totalPatients} patients (delta: ${arrivalDelta}), ${averageWaitTime}min wait`);

      await this.queueStatusService.createQueueData({
        totalPatients,
        waitingPatients: Math.max(0, totalPatients - roomOccupied),
        averageWaitTime,
        triage: {
          critical,
          urgent,
          standard
        },
        roomOccupancy: {
          total: totalRooms,
          occupied: roomOccupied,
          available: totalRooms - roomOccupied
        }
      });

      this.lastQueueUpdateTime = now;
    } catch (error) {
      console.error('Error updating queue data from sensors:', error);
    }
  }

  async generateSyntheticHistoricalData(hoursBack: number = 24): Promise<void> {
    console.log(`Generating ${hoursBack} hours of synthetic historical data...`);
    
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    
    for (let i = hoursBack; i >= 1; i--) {
      const timestamp = new Date(now.getTime() - i * oneHour);
      
      // Generate realistic queue metrics based on time of day
      const hour = timestamp.getHours();
      let basePatients = 8;
      
      // Simulate daily patterns - busier during day hours
      if (hour >= 8 && hour <= 18) {
        basePatients = Math.floor(Math.random() * 15) + 10; // 10-25 patients
      } else if (hour >= 19 && hour <= 23) {
        basePatients = Math.floor(Math.random() * 12) + 8; // 8-20 patients  
      } else {
        basePatients = Math.floor(Math.random() * 8) + 3; // 3-11 patients
      }
      
      const totalPatients = basePatients;
      const averageWaitTime = Math.floor(Math.random() * 40) + 20; // 20-60 minutes
      const roomOccupied = Math.min(totalPatients + Math.floor(Math.random() * 5), 20);
      
      // Estimate triage distribution
      const critical = Math.floor(totalPatients * (0.05 + Math.random() * 0.1)); // 5-15%
      const urgent = Math.floor(totalPatients * (0.2 + Math.random() * 0.2)); // 20-40%
      const standard = Math.max(0, totalPatients - critical - urgent);
      
      // Create queue data directly using the existing service method with custom timestamp
      await this.queueStatusService.createQueueData({
        totalPatients,
        waitingPatients: Math.max(0, totalPatients - roomOccupied),
        averageWaitTime,
        triage: {
          critical,
          urgent,
          standard
        },
        roomOccupancy: {
          total: 20,
          occupied: roomOccupied,
          available: 20 - roomOccupied
        },
        timestamp
      });
      
      console.log(`Generated data for ${timestamp.toISOString()}: ${totalPatients} patients, ${averageWaitTime}min wait`);
    }
    
    console.log('Synthetic historical data generation complete');
  }
}
