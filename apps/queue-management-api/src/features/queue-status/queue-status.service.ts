import { QueueStatusRepository } from './queue-status.repository.js';
import { QueueData, QueueAnalytics, QueueAlert } from '../../shared/types/queue.js';
import { CreateQueueDataRequest, QueueStatusResponse } from './queue-status.types.js';
import { generateId } from '../../shared/utils/date-helpers.js';

export class QueueStatusService {
  constructor(private queueStatusRepository: QueueStatusRepository) {}

  async getCurrentStatus(): Promise<QueueData | null> {
    return this.queueStatusRepository.getCurrentStatus();
  }

  async getHistoricalData(hours: number): Promise<QueueData[]> {
    if (hours <= 0) {
      throw new Error('Hours must be a positive number');
    }
    
    return this.queueStatusRepository.getHistoricalData(hours);
  }

  async createQueueData(request: CreateQueueDataRequest): Promise<QueueData> {
    const queueData = {
      ...request,
      timestamp: request.timestamp || new Date()
    };

    return this.queueStatusRepository.saveQueueData(queueData);
  }

  async getAnalytics(): Promise<QueueAnalytics> {
    const hourlyAverages = await this.queueStatusRepository.getHourlyAverages(168); // 7 days
    const last24Hours = await this.queueStatusRepository.getHistoricalData(24);
    const last7Days = await this.queueStatusRepository.getHistoricalData(168);

    // Calculate peak hours
    const peakHours = hourlyAverages
      .sort((a, b) => b.averagePatients - a.averagePatients)
      .slice(0, 3);

    // Calculate daily volume
    const averageDailyVolume = last7Days.length > 0 
      ? Math.round(last7Days.reduce((sum, data) => sum + data.totalPatients, 0) / 7)
      : 0;

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(last24Hours);

    // Calculate trends
    const weeklyGrowth = this.calculateWeeklyGrowth(last7Days);

    return {
      peakHours,
      averageDailyVolume,
      bottlenecks,
      trends: {
        weeklyGrowth,
        seasonalPattern: 'Normal' // Simplified for now
      }
    };
  }

  async getStatusWithTrends(): Promise<QueueStatusResponse> {
    const current = await this.getCurrentStatus();
    if (!current) {
      throw new Error('No current queue data available');
    }

    const last24Hours = await this.queueStatusRepository.getHistoricalData(24);
    const alerts = await this.generateAlerts(current, last24Hours);

    // Calculate trends
    const hourlyChange = this.calculateHourlyChange(last24Hours);
    const dailyAverage = last24Hours.length > 0 
      ? Math.round(last24Hours.reduce((sum, data) => sum + data.totalPatients, 0) / last24Hours.length)
      : 0;

    return {
      current,
      trends: {
        hourlyChange,
        dailyAverage
      },
      alerts
    };
  }

  private identifyBottlenecks(data: QueueData[]): QueueAnalytics['bottlenecks'] {
    const bottlenecks: QueueAnalytics['bottlenecks'] = [];

    if (data.length === 0) return bottlenecks;

    const averageWaitTime = data.reduce((sum, d) => sum + d.averageWaitTime, 0) / data.length;
    const averageOccupancy = data.reduce((sum, d) => sum + (d.roomOccupancy.occupied / d.roomOccupancy.total), 0) / data.length;

    if (averageWaitTime > 60) {
      bottlenecks.push({
        type: 'staffing',
        severity: averageWaitTime > 120 ? 'high' : 'medium',
        description: `Average wait time is ${Math.round(averageWaitTime)} minutes`
      });
    }

    if (averageOccupancy > 0.9) {
      bottlenecks.push({
        type: 'rooms',
        severity: averageOccupancy > 0.95 ? 'high' : 'medium',
        description: `Room occupancy is ${Math.round(averageOccupancy * 100)}%`
      });
    }

    return bottlenecks;
  }

  private calculateWeeklyGrowth(data: QueueData[]): number {
    if (data.length < 2) return 0;

    const sortedData = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstAverage = firstHalf.reduce((sum, d) => sum + d.totalPatients, 0) / firstHalf.length;
    const secondAverage = secondHalf.reduce((sum, d) => sum + d.totalPatients, 0) / secondHalf.length;

    return firstAverage > 0 ? Math.round(((secondAverage - firstAverage) / firstAverage) * 100) : 0;
  }

  private calculateHourlyChange(data: QueueData[]): number {
    if (data.length < 2) return 0;

    const sortedData = data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const current = sortedData[0];
    if (!current) return 0;
    
    const oneHourAgo = sortedData.find(d => 
      current.timestamp.getTime() - d.timestamp.getTime() >= 60 * 60 * 1000
    );

    if (!oneHourAgo) return 0;

    return current.totalPatients - oneHourAgo.totalPatients;
  }

  private async generateAlerts(current: QueueData, historical: QueueData[]): Promise<QueueAlert[]> {
    const alerts: QueueAlert[] = [];

    // High volume alert
    if (current.totalPatients > 50) {
      alerts.push({
        id: generateId(),
        type: 'high_volume',
        severity: current.totalPatients > 75 ? 'critical' : 'high',
        message: `High patient volume: ${current.totalPatients} patients`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Long wait time alert
    if (current.averageWaitTime > 90) {
      alerts.push({
        id: generateId(),
        type: 'long_wait',
        severity: current.averageWaitTime > 150 ? 'critical' : 'high',
        message: `Long wait times: ${current.averageWaitTime} minutes average`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Critical patients alert
    if (current.triage.critical > 5) {
      alerts.push({
        id: generateId(),
        type: 'critical_patient',
        severity: 'critical',
        message: `${current.triage.critical} critical patients waiting`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Room capacity alert
    const occupancyRate = current.roomOccupancy.occupied / current.roomOccupancy.total;
    if (occupancyRate > 0.9) {
      alerts.push({
        id: generateId(),
        type: 'staff_shortage',
        severity: occupancyRate > 0.95 ? 'critical' : 'high',
        message: `Room capacity at ${Math.round(occupancyRate * 100)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    return alerts;
  }
}
