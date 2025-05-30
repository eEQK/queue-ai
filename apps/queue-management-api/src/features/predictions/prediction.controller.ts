import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChronosPredictionService } from './chronos-prediction.service.js';
import { QueueStatusRepository } from '../queue-status/queue-status.repository.js';
import type { PredictionRequest } from '../../shared/types/prediction.js';

interface PredictionQuery {
  type: 'queue-length' | 'wait-time';
  hours?: string;
  includeInsights?: string;
}

export async function predictionRoutes(fastify: FastifyInstance) {
  const predictionService = new ChronosPredictionService();
  const queueRepository = fastify.serviceContainer.get<QueueStatusRepository>('queueStatusRepository');

  // GET /api/predictions - Get queue predictions
  fastify.get<{ Querystring: PredictionQuery }>('/api/predictions', async (request, reply) => {
    try {
      const { type = 'queue-length', hours = '6', includeInsights = 'false' } = request.query;
      const forecastHours = Math.min(Math.max(parseInt(hours), 1), 24); // Limit to 1-24 hours
      
      // Get historical data for predictions (last 48 hours)
      const historicalData = await queueRepository.getHistoricalData(48);
      
      if (historicalData.length === 0) {
        return reply.status(400).send({
          error: 'Insufficient historical data',
          message: 'No historical queue data available for predictions'
        });
      }

      let predictions;
      if (type === 'queue-length') {
        predictions = await predictionService.predictQueueLength(historicalData, forecastHours);
      } else {
        predictions = await predictionService.predictWaitTimes(historicalData, forecastHours);
      }

      const response: any = {
        type,
        forecastHours,
        predictions,
        generatedAt: new Date(),
        dataPointsUsed: historicalData.length
      };

      // Include insights if requested
      if (includeInsights === 'true') {
        response.insights = await predictionService.generateInsights(predictions, historicalData);
      }

      return response;
    } catch (error) {
      console.error('Prediction error:', error);
      return reply.status(500).send({
        error: 'Prediction failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // POST /api/predictions - Get custom predictions
  fastify.post<{ Body: PredictionRequest }>('/api/predictions', async (request, reply) => {
    try {
      const { type, forecastHours, includeConfidenceInterval } = request.body;
      
      if (!type || !forecastHours) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'type and forecastHours are required'
        });
      }

      if (forecastHours < 1 || forecastHours > 72) {
        return reply.status(400).send({
          error: 'Invalid forecast hours',
          message: 'forecastHours must be between 1 and 72'
        });
      }

      // Get historical data
      const historicalData = await queueRepository.getHistoricalData(Math.min(forecastHours * 2, 168));
      
      if (historicalData.length < 3) {
        return reply.status(400).send({
          error: 'Insufficient historical data',
          message: 'At least 3 historical data points required for predictions'
        });
      }

      let predictions;
      if (type === 'queue-length') {
        predictions = await predictionService.predictQueueLength(historicalData, forecastHours);
      } else {
        predictions = await predictionService.predictWaitTimes(historicalData, forecastHours);
      }

      // Filter confidence intervals if not requested
      if (!includeConfidenceInterval) {
        predictions = predictions.map(p => {
          const { confidenceInterval, ...rest } = p;
          return rest;
        });
      }

      return {
        type,
        forecastHours,
        predictions,
        includeConfidenceInterval,
        generatedAt: new Date(),
        dataPointsUsed: historicalData.length
      };
    } catch (error) {
      console.error('Custom prediction error:', error);
      return reply.status(500).send({
        error: 'Prediction failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // GET /api/predictions/insights - Get predictive insights
  fastify.get('/api/predictions/insights', async (request, reply) => {
    try {
      const historicalData = await queueRepository.getHistoricalData(24);
      
      if (historicalData.length === 0) {
        return reply.status(400).send({
          error: 'No data available',
          message: 'No historical data available for insights'
        });
      }

      // Generate predictions for insights
      const queuePredictions = await predictionService.predictQueueLength(historicalData, 12);
      const waitTimePredictions = await predictionService.predictWaitTimes(historicalData, 12);
      
      // Generate insights
      const queueInsights = await predictionService.generateInsights(queuePredictions, historicalData);
      const waitTimeInsights = await predictionService.generateInsights(waitTimePredictions, historicalData);
      
      return {
        insights: [...queueInsights, ...waitTimeInsights],
        generatedAt: new Date(),
        dataPointsUsed: historicalData.length,
        forecastHorizon: '12 hours'
      };
    } catch (error) {
      console.error('Insights error:', error);
      return reply.status(500).send({
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // GET /api/predictions/model/metrics - Get model performance metrics
  fastify.get('/api/predictions/model/metrics', async (request, reply) => {
    try {
      const metrics = await predictionService.getModelMetrics();
      
      return {
        model: metrics,
        status: 'active',
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Model metrics error:', error);
      return reply.status(500).send({
        error: 'Failed to get model metrics',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // GET /api/predictions/batch - Get batch predictions for multiple time horizons
  fastify.get('/api/predictions/batch', async (request, reply) => {
    try {
      const historicalData = await queueRepository.getHistoricalData(48);
      
      if (historicalData.length < 3) {
        return reply.status(400).send({
          error: 'Insufficient data',
          message: 'At least 3 historical data points required'
        });
      }

      // Generate predictions for multiple horizons
      const horizons = [1, 3, 6, 12, 24];
      const batchResults = await Promise.all(
        horizons.map(async (hours) => {
          const queuePredictions = await predictionService.predictQueueLength(historicalData, hours);
          const waitTimePredictions = await predictionService.predictWaitTimes(historicalData, hours);
          
          return {
            forecastHours: hours,
            queueLength: queuePredictions,
            waitTimes: waitTimePredictions
          };
        })
      );

      return {
        batchPredictions: batchResults,
        generatedAt: new Date(),
        dataPointsUsed: historicalData.length
      };
    } catch (error) {
      console.error('Batch prediction error:', error);
      return reply.status(500).send({
        error: 'Batch prediction failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
}
