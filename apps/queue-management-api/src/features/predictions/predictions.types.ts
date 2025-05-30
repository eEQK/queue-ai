import { Prediction } from '../../shared/types/prediction.js';

export interface PredictionTypes {
  Prediction: Prediction;
}

export interface PredictionRequest {
  type: 'queue-length' | 'wait-time';
  forecastHours: number;
  includeConfidenceInterval: boolean;
}

export interface PredictionResponse {
  predictions: Prediction[];
  modelInfo: {
    name: string;
    version: string;
    accuracy: number;
  };
  generatedAt: Date;
}

// Placeholder - will be implemented in Phase 3
