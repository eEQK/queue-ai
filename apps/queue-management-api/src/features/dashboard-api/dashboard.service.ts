import { QueueStatusService } from '../queue-status/queue-status.service.js';
import { IoTDataService } from '../iot-data/iot-data.service.js';
import { DashboardOverview, RealTimeData } from './dashboard.types.js';

export class DashboardService {
  constructor(
    private queueStatusService: QueueStatusService,
    private iotDataService: IoTDataService
  ) {}

  async getOverviewData(): Promise<DashboardOverview> {
    try {
      // Get current queue status
      const queueStatus = await this.queueStatusService.getCurrentStatus();
      
      // Get system health
      const systemHealth = await this.iotDataService.getSystemHealth();
      
      // Get recent alerts (simplified - in real app this would come from alerts service)
      const statusWithTrends = queueStatus ? await this.queueStatusService.getStatusWithTrends() : null;
      const recentAlerts = statusWithTrends?.alerts.slice(0, 5).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp
      })) || [];

      // Calculate key metrics
      const keyMetrics = await this.calculateKeyMetrics();

      return {
        queueStatus,
        systemHealth,
        recentAlerts,
        keyMetrics
      };
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      throw error;
    }
  }

  async getRealTimeData(): Promise<RealTimeData> {
    try {
      const queueStatus = await this.queueStatusService.getCurrentStatus();
      const systemHealth = await this.iotDataService.getSystemHealth();
      
      // Get latest sensor readings for real-time data
      const arrivals = await this.iotDataService.getSensorReadingsByType('arrival', 1);
      const occupancy = await this.iotDataService.getSensorReadingsByType('occupancy', 1);
      const staff = await this.iotDataService.getSensorReadingsByType('staff', 1);

      const latestOccupancy = occupancy[occupancy.length - 1];
      const latestStaff = staff[staff.length - 1];

      return {
        timestamp: new Date(),
        queueLength: queueStatus?.totalPatients || 0,
        waitTime: queueStatus?.averageWaitTime || 0,
        roomOccupancy: latestOccupancy?.value || 0,
        staffAvailable: latestStaff?.value || 0,
        activeSensors: systemHealth.onlineSensors
      };
    } catch (error) {
      console.error('Error getting real-time data:', error);
      throw error;
    }
  }

  private async calculateKeyMetrics() {
    try {
      // Get today's data
      const today24Hours = await this.queueStatusService.getHistoricalData(24);
      
      const totalPatientsToday = today24Hours.length > 0 
        ? Math.max(...today24Hours.map(d => d.totalPatients))
        : 0;

      const averageWaitTime = today24Hours.length > 0
        ? Math.round(today24Hours.reduce((sum, d) => sum + d.averageWaitTime, 0) / today24Hours.length)
        : 0;

      // Find peak hour
      const hourlyData = new Map<number, number>();
      today24Hours.forEach(data => {
        const hour = data.timestamp.getHours();
        const existing = hourlyData.get(hour) || 0;
        hourlyData.set(hour, Math.max(existing, data.totalPatients));
      });

      const peakHourToday = hourlyData.size > 0 
        ? Array.from(hourlyData.entries()).reduce((max, [hour, count]) => 
            count > (max?.patientCount || 0) ? { hour, patientCount: count } : max, 
            null as { hour: number; patientCount: number } | null)
        : null;

      // Simple system uptime calculation (percentage of sensors online)
      const systemHealth = await this.iotDataService.getSystemHealth();
      const systemUptime = systemHealth.totalSensors > 0 
        ? Math.round((systemHealth.onlineSensors / systemHealth.totalSensors) * 100)
        : 100;

      return {
        totalPatientsToday,
        averageWaitTime,
        peakHourToday,
        systemUptime
      };
    } catch (error) {
      console.error('Error calculating key metrics:', error);
      return {
        totalPatientsToday: 0,
        averageWaitTime: 0,
        peakHourToday: null,
        systemUptime: 0
      };
    }
  }
}
