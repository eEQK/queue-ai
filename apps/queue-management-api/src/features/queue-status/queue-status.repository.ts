import { IDataRepository } from '../../shared/repositories/repository.interface.js';
import { QueueData } from '../../shared/types/queue.js';
import { TimeRange } from '../../shared/types/common.js';
import { generateId, getTimeRangeForHours } from '../../shared/utils/date-helpers.js';

export class QueueStatusRepository {
  constructor(private dataRepository: IDataRepository) {}

  async saveQueueData(queueData: Omit<QueueData, 'id' | 'createdAt' | 'updatedAt'>): Promise<QueueData> {
    const fullQueueData: QueueData = {
      ...queueData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.dataRepository.saveQueueData(fullQueueData);
    return fullQueueData;
  }

  async getCurrentStatus(): Promise<QueueData | null> {
    return this.dataRepository.getLatestQueueData();
  }

  async getHistoricalData(hours: number): Promise<QueueData[]> {
    return this.dataRepository.getHistoricalData(hours);
  }

  async getDataByTimeRange(timeRange: TimeRange): Promise<QueueData[]> {
    return this.dataRepository.getQueueDataByTimeRange(timeRange);
  }

  async getHourlyAverages(hours: number = 24): Promise<Array<{ hour: number; averagePatients: number; averageWaitTime: number }>> {
    const data = await this.getHistoricalData(hours);
    const hourlyData = new Map<number, { totalPatients: number; totalWaitTime: number; count: number }>();

    data.forEach(queueData => {
      const hour = queueData.timestamp.getHours();
      const existing = hourlyData.get(hour) || { totalPatients: 0, totalWaitTime: 0, count: 0 };
      
      existing.totalPatients += queueData.totalPatients;
      existing.totalWaitTime += queueData.averageWaitTime;
      existing.count += 1;
      
      hourlyData.set(hour, existing);
    });

    return Array.from(hourlyData.entries()).map(([hour, stats]) => ({
      hour,
      averagePatients: Math.round(stats.totalPatients / stats.count),
      averageWaitTime: Math.round(stats.totalWaitTime / stats.count)
    }));
  }
}
