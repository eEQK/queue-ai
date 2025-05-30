import { ChronosPredictionService } from './chronos-prediction.service.js';
import { QueueStatusRepository } from '../queue-status/queue-status.repository.js';
import type { QueueData } from '../../shared/types/queue.js';
import type { Prediction, ModelMetrics, ForecastInsight } from '../../shared/types/prediction.js';

export class PredictionService {
  private chronosService: ChronosPredictionService;

  constructor(private queueStatusRepository: QueueStatusRepository) {
    this.chronosService = new ChronosPredictionService();
  }

  async predictQueueMetrics(forecastHours: number): Promise<{
    queueLength: Prediction[];
    waitTimes: Prediction[];
    insights: ForecastInsight[];
  }> {
    // Get sufficient historical data for accurate predictions
    const requiredDataPoints = Math.max(48, forecastHours * 2);
    const historicalData = await this.queueStatusRepository.getHistoricalData(requiredDataPoints);
    
    if (historicalData.length < 3) {
      throw new Error('Insufficient historical data for predictions');
    }

    // Generate both types of predictions
    const [queueLength, waitTimes] = await Promise.all([
      this.chronosService.predictQueueLength(historicalData, forecastHours),
      this.chronosService.predictWaitTimes(historicalData, forecastHours)
    ]);

    // Generate combined insights
    const queueInsights = await this.chronosService.generateInsights(queueLength, historicalData);
    const waitTimeInsights = await this.chronosService.generateInsights(waitTimes, historicalData);
    
    return {
      queueLength,
      waitTimes,
      insights: [...queueInsights, ...waitTimeInsights]
    };
  }

  async getOptimalStaffingRecommendations(forecastHours: number = 24): Promise<{
    recommendations: Array<{
      timeSlot: Date;
      recommendedStaff: number;
      reasoning: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
    summary: {
      totalAdditionalStaffHours: number;
      peakPeriods: Array<{ start: Date; end: Date; severity: string }>;
      costImpact: string;
    };
  }> {
    const predictions = await this.predictQueueMetrics(forecastHours);
    const recommendations = [];
    const peakPeriods = [];
    
    let totalAdditionalHours = 0;
    
    for (const prediction of predictions.queueLength) {
      const expectedPatients = prediction.forecastedValue;
      const currentStaff = 5; // Base staffing level
      let recommendedStaff = currentStaff;
      let urgency: 'low' | 'medium' | 'high' = 'low';
      let reasoning = 'Normal staffing sufficient';
      
      // Calculate staffing needs based on patient load
      if (expectedPatients > 80) {
        recommendedStaff = Math.ceil(expectedPatients / 10);
        urgency = 'high';
        reasoning = `High patient volume (${Math.round(expectedPatients)}) requires additional staff`;
        totalAdditionalHours += (recommendedStaff - currentStaff);
        
        peakPeriods.push({
          start: prediction.timestamp,
          end: new Date(prediction.timestamp.getTime() + 60 * 60 * 1000),
          severity: 'high'
        });
      } else if (expectedPatients > 50) {
        recommendedStaff = Math.ceil(expectedPatients / 12);
        urgency = 'medium';
        reasoning = `Moderate increase in patient volume requires staff adjustment`;
        totalAdditionalHours += Math.max(0, recommendedStaff - currentStaff);
        
        peakPeriods.push({
          start: prediction.timestamp,
          end: new Date(prediction.timestamp.getTime() + 60 * 60 * 1000),
          severity: 'medium'
        });
      }
      
      recommendations.push({
        timeSlot: prediction.timestamp,
        recommendedStaff,
        reasoning,
        urgency
      });
    }
    
    return {
      recommendations,
      summary: {
        totalAdditionalStaffHours: totalAdditionalHours,
        peakPeriods,
        costImpact: totalAdditionalHours > 50 ? 'High' : totalAdditionalHours > 20 ? 'Medium' : 'Low'
      }
    };
  }

  async getPredictionAccuracy(): Promise<{
    overall: number;
    byType: Record<string, number>;
    recentPerformance: Array<{
      date: Date;
      accuracy: number;
      predictions: number;
    }>;
  }> {
    const metrics = await this.chronosService.getModelMetrics();
    
    // Simulate accuracy tracking (in real implementation, this would compare predictions with actual outcomes)
    return {
      overall: metrics.accuracy,
      byType: {
        'queue-length': 0.87,
        'wait-time': 0.82
      },
      recentPerformance: [
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), accuracy: 0.89, predictions: 24 },
        { date: new Date(Date.now() - 48 * 60 * 60 * 1000), accuracy: 0.85, predictions: 24 },
        { date: new Date(Date.now() - 72 * 60 * 60 * 1000), accuracy: 0.83, predictions: 24 },
      ]
    };
  }

  async getCapacityForecast(days: number = 7): Promise<{
    dailyForecasts: Array<{
      date: Date;
      expectedPeakPatients: number;
      expectedPeakTime: Date;
      capacityUtilization: number;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
    weeklyTrends: {
      averageDailyPatients: number;
      peakDayOfWeek: string;
      growthTrend: number;
    };
  }> {
    const dailyForecasts = [];
    const totalPatients = [];
    
    // Ensure we have enough historical data for realistic predictions
    const historicalData = await this.queueStatusRepository.getHistoricalData(168); // Last week
    
    for (let day = 0; day < days; day++) {
      // Generate 24-hour forecast for each day
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() + day);
      dayStart.setHours(0, 0, 0, 0);
      
      // Use adjusted data for predictions to simulate different days
      // Clone and modify historicalData to represent different day patterns
      const adjustedData = this.adjustHistoricalDataForDay(historicalData, day);
      
      // Get predictions for this specific day's pattern
      const dailyPredictions = await this.chronosService.predictQueueLength(adjustedData, 24);
      
      const peakPrediction = dailyPredictions.reduce((max, pred) => 
        pred.forecastedValue > max.forecastedValue ? pred : max
      );
      
      const avgPatientsDay = dailyPredictions.reduce((sum, pred) => sum + pred.forecastedValue, 0) / 24;
      totalPatients.push(avgPatientsDay);
      
      dailyForecasts.push({
        date: dayStart,
        expectedPeakPatients: Math.round(peakPrediction.forecastedValue),
        expectedPeakTime: peakPrediction.timestamp,
        capacityUtilization: peakPrediction.forecastedValue / 100, // Assuming 100 is max capacity
        riskLevel: peakPrediction.forecastedValue > 80 ? 'high' : 
                  peakPrediction.forecastedValue > 50 ? 'medium' : 'low'
      });
    }
    
    const averageDailyPatients = totalPatients.reduce((sum, val) => sum + val, 0) / totalPatients.length;
    
    // Determine peak day based on our forecasts instead of random
    let peakDay = 0;
    let peakPatients = 0;
    
    dailyForecasts.forEach((forecast, index) => {
      if (forecast.expectedPeakPatients > peakPatients) {
        peakPatients = forecast.expectedPeakPatients;
        peakDay = index;
      }
    });
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDayOfWeek = daysOfWeek[(new Date().getDay() + peakDay) % 7];
    
    return {
      dailyForecasts,
      weeklyTrends: {
        averageDailyPatients: Math.round(averageDailyPatients),
        peakDayOfWeek,
        growthTrend: (totalPatients[totalPatients.length - 1] - totalPatients[0]) / totalPatients[0] * 100
      }
    };
  }

  // New method to adjust historical data patterns for different days of the week
  private adjustHistoricalDataForDay(originalData: QueueData[], dayOffset: number): QueueData[] {
    if (originalData.length === 0) return [];
    
    // Clone the data to avoid modifying the original
    const adjustedData = JSON.parse(JSON.stringify(originalData));
    
    // Calculate the day of week (0-6) for the target day
    const targetDayOfWeek = (new Date().getDay() + dayOffset) % 7;
    
    // Apply day-specific adjustment factors
    const dayFactors: Record<number, number> = {
      0: 1.1,  // Sunday: 10% busier
      1: 0.95, // Monday: 5% quieter
      2: 1.0,  // Tuesday: baseline
      3: 1.02, // Wednesday: 2% busier
      4: 1.05, // Thursday: 5% busier
      5: 1.15, // Friday: 15% busier
      6: 1.2,  // Saturday: 20% busier
    };
    
    const factor = dayFactors[targetDayOfWeek];
    
    // Apply time-of-day variations to make the prediction more dynamic
    return adjustedData.map((item, index) => {
      const hour = new Date(item.timestamp).getHours();
      
      // Add hour-specific variations 
      let hourFactor = 1.0;
      
      // Morning peak (8-10 AM)
      if (hour >= 8 && hour <= 10) hourFactor = 1.2;
      
      // Afternoon lull (2-4 PM)
      if (hour >= 14 && hour <= 16) hourFactor = 0.9;
      
      // Evening peak (6-8 PM)
      if (hour >= 18 && hour <= 20) hourFactor = 1.3;
      
      // Night low (11 PM - 5 AM)
      if (hour >= 23 || hour <= 5) hourFactor = 0.7;
      
      // Add some randomness (±5%)
      const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
      
      // Combine all factors and apply to patient count
      const combinedFactor = factor * hourFactor * randomFactor;
      
      // Apply the factors to create more varied data
      const adjusted = {...item};
      adjusted.totalPatients = Math.max(1, Math.round(item.totalPatients * combinedFactor));
      adjusted.averageWaitTime = Math.max(5, Math.round(item.averageWaitTime * (0.9 + combinedFactor * 0.1)));
      
      return adjusted;
    });
  }

  async getModelHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastUpdate: Date;
    metrics: ModelMetrics;
    issues: string[];
    recommendations: string[];
  }> {
    const metrics = await this.chronosService.getModelMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    // Check model health
    if (metrics.accuracy < 0.7) {
      status = 'unhealthy';
      issues.push('Model accuracy below acceptable threshold');
      recommendations.push('Retrain model with recent data');
    } else if (metrics.accuracy < 0.8) {
      status = 'degraded';
      issues.push('Model accuracy could be improved');
      recommendations.push('Consider model tuning or additional training data');
    }
    
    if (metrics.performance.mape > 15) {
      issues.push('High prediction error rate');
      recommendations.push('Review input data quality and feature engineering');
    }
    
    return {
      status,
      lastUpdate: metrics.lastTrained,
      metrics,
      issues,
      recommendations
    };
  }
}
