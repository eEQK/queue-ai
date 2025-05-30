export interface MLModelConfig {
  modelName: string;
  predictionInterval: number; // milliseconds
  maxHistoryHours: number;
  confidenceThreshold: number;
  batchSize: number;
}

export const mlModelConfig: MLModelConfig = {
  modelName: process.env.MODEL_NAME || 'amazon/chronos-bolt-tiny',
  predictionInterval: parseInt(process.env.PREDICTION_INTERVAL || '300000'), // 5 minutes
  maxHistoryHours: parseInt(process.env.MAX_HISTORY_HOURS || '168'), // 7 days
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.8'),
  batchSize: parseInt(process.env.BATCH_SIZE || '32')
};
