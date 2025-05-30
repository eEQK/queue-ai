import type { BaseEntity, TimeRange } from './common.js';

export interface Prediction extends BaseEntity {
  timestamp: Date;
  forecastedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  type: 'queue-length' | 'wait-time';
  modelVersion: string;
  accuracy?: number;
}

export interface PredictionRequest {
  type: 'queue-length' | 'wait-time';
  forecastHours: number;
  includeConfidenceInterval: boolean;
}

export interface ModelMetrics {
  modelName: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  dataPointsUsed: number;
  performance: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    mape: number; // Mean Absolute Percentage Error
  };
}

export interface ForecastInsight {
  type: 'peak_prediction' | 'capacity_warning' | 'trend_change';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  recommendedAction?: string;
  timeframe: TimeRange;
  confidence: number;
}
