// API Configuration and Types
export const API_BASE_URL = 'http://localhost:3000/api';

export interface QueueData {
  timestamp: string;
  queueLength: number;
  averageWaitTime: number;
  status: 'normal' | 'busy' | 'critical';
}

export interface PredictionData {
  timestamp: string;
  predictions: {
    queueLength: number[];
    waitTime: number[];
    timeHorizon: string[];
  };
  insights: {
    message: string;
    type: 'info' | 'warning' | 'critical';
    confidence: number;
  }[];
  model: {
    accuracy: number;
    lastUpdated: string;
    status: 'healthy' | 'degraded' | 'error';
  };
}

export interface StaffingRecommendation {
  currentStaff: number;
  recommendedStaff: number;
  staffingLevel: 'understaffed' | 'optimal' | 'overstaffed';
  reasoning: string;
  confidence: number;
}

export interface AdvancedMetrics {
  capacity: {
    current: number;
    maximum: number;
    utilization: number;
    projectedPeak: {
      time: string;
      expected: number;
    };
  };
  accuracy: {
    mae: number;
    rmse: number;
    mape: number;
    lastEvaluation: string;
  };
  health: {
    status: 'healthy' | 'degraded' | 'error';
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface ScenarioAnalysis {
  scenario: 'normal' | 'high_volume' | 'emergency' | 'staff_shortage';
  predictions: {
    queueLength: number[];
    waitTime: number[];
    timeHorizon: string[];
  };
  impact: {
    description: string;
    severity: 'low' | 'medium' | 'high';
  };
}
