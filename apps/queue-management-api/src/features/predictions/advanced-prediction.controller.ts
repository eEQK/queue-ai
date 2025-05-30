import { FastifyInstance } from 'fastify';
import { PredictionService } from './prediction.service.js';
import { QueueStatusRepository } from '../queue-status/queue-status.repository.js';

export async function advancedPredictionRoutes(fastify: FastifyInstance) {
  const queueRepository = fastify.serviceContainer.get<QueueStatusRepository>('queueStatusRepository');
  const predictionService = new PredictionService(queueRepository);

  // GET /api/predictions/advanced/metrics - Get comprehensive queue predictions
  fastify.get('/api/predictions/advanced/metrics', async (request, reply) => {
    try {
      const { hours = '12' } = request.query as { hours?: string };
      const forecastHours = Math.min(Math.max(parseInt(hours), 1), 72);
      
      const predictions = await predictionService.predictQueueMetrics(forecastHours);
      
      return {
        status: 'success',
        forecastHours,
        predictions,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Advanced metrics prediction error:', error);
      return reply.status(500).send({
        error: 'Failed to generate advanced predictions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/predictions/advanced/staffing - Get staffing recommendations
  fastify.get('/api/predictions/advanced/staffing', async (request, reply) => {
    try {
      const { hours = '24' } = request.query as { hours?: string };
      const forecastHours = Math.min(Math.max(parseInt(hours), 1), 72);
      
      const staffingRec = await predictionService.getOptimalStaffingRecommendations(forecastHours);
      
      return {
        status: 'success',
        forecastHours,
        staffing: staffingRec,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Staffing recommendation error:', error);
      return reply.status(500).send({
        error: 'Failed to generate staffing recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/predictions/advanced/capacity - Get capacity forecast
  fastify.get('/api/predictions/advanced/capacity', async (request, reply) => {
    try {
      const { days = '7' } = request.query as { days?: string };
      const forecastDays = Math.min(Math.max(parseInt(days), 1), 14);
      
      const capacityForecast = await predictionService.getCapacityForecast(forecastDays);
      
      return {
        status: 'success',
        forecastDays,
        capacity: capacityForecast,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Capacity forecast error:', error);
      return reply.status(500).send({
        error: 'Failed to generate capacity forecast',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/predictions/advanced/accuracy - Get prediction accuracy metrics
  fastify.get('/api/predictions/advanced/accuracy', async (request, reply) => {
    try {
      const accuracy = await predictionService.getPredictionAccuracy();
      
      return {
        status: 'success',
        accuracy,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Accuracy metrics error:', error);
      return reply.status(500).send({
        error: 'Failed to get accuracy metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/predictions/advanced/health - Get model health status
  fastify.get('/api/predictions/advanced/health', async (request, reply) => {
    try {
      const health = await predictionService.getModelHealth();
      
      return {
        status: 'success',
        health,
        checkedAt: new Date()
      };
    } catch (error) {
      console.error('Model health check error:', error);
      return reply.status(500).send({
        error: 'Failed to check model health',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/predictions/advanced/scenario - Run scenario analysis
  fastify.post<{
    Body: {
      scenario: 'normal' | 'high_volume' | 'emergency' | 'staff_shortage';
      baselineMultiplier?: number;
      durationHours?: number;
    }
  }>('/api/predictions/advanced/scenario', async (request, reply) => {
    try {
      const { scenario, baselineMultiplier = 1.0, durationHours = 12 } = request.body;
      
      if (!scenario) {
        return reply.status(400).send({
          error: 'Missing scenario',
          message: 'scenario parameter is required'
        });
      }

      // Get base predictions
      const basePredictions = await predictionService.predictQueueMetrics(durationHours);
      
      // Apply scenario modifications
      let scenarioMultiplier = 1.0;
      let scenarioDescription = '';
      
      switch (scenario) {
        case 'high_volume':
          scenarioMultiplier = 1.5;
          scenarioDescription = 'High volume scenario with 50% increased patient load';
          break;
        case 'emergency':
          scenarioMultiplier = 2.0;
          scenarioDescription = 'Emergency scenario with doubled patient load';
          break;
        case 'staff_shortage':
          scenarioMultiplier = 1.3;
          scenarioDescription = 'Staff shortage scenario with 30% increased wait times';
          break;
        default:
          scenarioDescription = 'Normal operational scenario';
      }
      
      // Modify predictions based on scenario
      const modifiedPredictions = {
        queueLength: basePredictions.queueLength.map(p => ({
          ...p,
          forecastedValue: p.forecastedValue * scenarioMultiplier * baselineMultiplier,
          confidenceInterval: {
            lower: p.confidenceInterval.lower * scenarioMultiplier * baselineMultiplier,
            upper: p.confidenceInterval.upper * scenarioMultiplier * baselineMultiplier
          }
        })),
        waitTimes: basePredictions.waitTimes.map(p => ({
          ...p,
          forecastedValue: scenario === 'staff_shortage' 
            ? p.forecastedValue * scenarioMultiplier * baselineMultiplier
            : p.forecastedValue * Math.sqrt(scenarioMultiplier) * baselineMultiplier,
          confidenceInterval: {
            lower: scenario === 'staff_shortage'
              ? p.confidenceInterval.lower * scenarioMultiplier * baselineMultiplier
              : p.confidenceInterval.lower * Math.sqrt(scenarioMultiplier) * baselineMultiplier,
            upper: scenario === 'staff_shortage'
              ? p.confidenceInterval.upper * scenarioMultiplier * baselineMultiplier
              : p.confidenceInterval.upper * Math.sqrt(scenarioMultiplier) * baselineMultiplier
          }
        }))
      };

      // Generate scenario-specific insights
      const scenarioInsights = scenario !== 'normal' ? [
        {
          type: 'scenario_analysis' as const,
          severity: scenario === 'emergency' ? 'critical' as const : 'warning' as const,
          description: `${scenarioDescription} - immediate action may be required`,
          recommendedAction: scenario === 'emergency' 
            ? 'Activate emergency protocols and call additional staff'
            : scenario === 'staff_shortage'
            ? 'Arrange backup staffing and extend shifts'
            : 'Prepare for increased patient volume',
          timeframe: {
            start: new Date(),
            end: new Date(Date.now() + durationHours * 60 * 60 * 1000)
          },
          confidence: 0.8
        }
      ] : [];

      return {
        status: 'success',
        scenario: {
          type: scenario,
          description: scenarioDescription,
          multiplier: scenarioMultiplier,
          baselineMultiplier,
          durationHours
        },
        predictions: modifiedPredictions,
        insights: [...basePredictions.insights, ...scenarioInsights],
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Scenario analysis error:', error);
      return reply.status(500).send({
        error: 'Failed to run scenario analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/predictions/advanced/summary - Get comprehensive prediction summary
  fastify.get('/api/predictions/advanced/summary', async (request, reply) => {
    try {
      const [
        predictions,
        staffingRec,
        accuracy,
        health
      ] = await Promise.all([
        predictionService.predictQueueMetrics(24),
        predictionService.getOptimalStaffingRecommendations(24),
        predictionService.getPredictionAccuracy(),
        predictionService.getModelHealth()
      ]);

      // Extract key metrics
      const maxQueueLength = Math.max(...predictions.queueLength.map(p => p.forecastedValue));
      const maxWaitTime = Math.max(...predictions.waitTimes.map(p => p.forecastedValue));
      const criticalInsights = predictions.insights.filter(i => i.severity === 'critical');
      const highUrgencyStaffing = staffingRec.recommendations.filter(r => r.urgency === 'high');

      return {
        status: 'success',
        summary: {
          next24Hours: {
            maxExpectedQueueLength: Math.round(maxQueueLength),
            maxExpectedWaitTime: Math.round(maxWaitTime),
            criticalAlertsCount: criticalInsights.length,
            highUrgencyStaffingPeriods: highUrgencyStaffing.length
          },
          modelStatus: {
            health: health.status,
            accuracy: accuracy.overall,
            lastUpdate: health.lastUpdate
          },
          keyInsights: predictions.insights.slice(0, 3), // Top 3 insights
          staffingSummary: {
            totalAdditionalHours: staffingRec.summary.totalAdditionalStaffHours,
            peakPeriods: staffingRec.summary.peakPeriods.length,
            costImpact: staffingRec.summary.costImpact
          }
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      return reply.status(500).send({
        error: 'Failed to generate prediction summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
