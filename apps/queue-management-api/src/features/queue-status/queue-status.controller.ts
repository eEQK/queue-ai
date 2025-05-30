import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QueueStatusService } from './queue-status.service.js';
import { CreateQueueDataRequest } from './queue-status.types.js';

export class QueueStatusController {
  constructor(private queueStatusService: QueueStatusService) {}

  async registerRoutes(fastify: FastifyInstance): Promise<void> {
    // GET /api/queue/current - Get current queue status
    fastify.get('/api/queue/current', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const status = await this.queueStatusService.getCurrentStatus();
        
        if (!status) {
          return reply.code(404).send({
            success: false,
            error: 'No current queue data available',
            timestamp: new Date()
          });
        }

        return reply.send({
          success: true,
          data: status,
          timestamp: new Date()
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          timestamp: new Date()
        });
      }
    });

    // GET /api/queue/status - Get current status with trends and alerts
    fastify.get('/api/queue/status', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const statusWithTrends = await this.queueStatusService.getStatusWithTrends();
        
        return reply.send({
          success: true,
          data: statusWithTrends,
          timestamp: new Date()
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          timestamp: new Date()
        });
      }
    });

    // GET /api/queue/history/:hours - Get historical queue data
    fastify.get<{
      Params: { hours: string }
    }>('/api/queue/history/:hours', async (request: FastifyRequest<{
      Params: { hours: string }
    }>, reply: FastifyReply) => {
      try {
        const hours = parseInt(request.params.hours);
        
        if (isNaN(hours) || hours <= 0) {
          return reply.code(400).send({
            success: false,
            error: 'Hours must be a positive number',
            timestamp: new Date()
          });
        }

        if (hours > 168) { // Max 7 days
          return reply.code(400).send({
            success: false,
            error: 'Maximum 168 hours (7 days) of history allowed',
            timestamp: new Date()
          });
        }

        const history = await this.queueStatusService.getHistoricalData(hours);
        
        return reply.send({
          success: true,
          data: history,
          timestamp: new Date()
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          timestamp: new Date()
        });
      }
    });

    // GET /api/queue/analytics - Get queue analytics
    fastify.get('/api/queue/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const analytics = await this.queueStatusService.getAnalytics();
        
        return reply.send({
          success: true,
          data: analytics,
          timestamp: new Date()
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          timestamp: new Date()
        });
      }
    });

    // POST /api/queue/data - Create new queue data entry (for testing/manual entry)
    fastify.post<{
      Body: CreateQueueDataRequest
    }>('/api/queue/data', async (request: FastifyRequest<{
      Body: CreateQueueDataRequest
    }>, reply: FastifyReply) => {
      try {
        const queueData = await this.queueStatusService.createQueueData(request.body);
        
        return reply.code(201).send({
          success: true,
          data: queueData,
          timestamp: new Date()
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
          timestamp: new Date()
        });
      }
    });
  }
}
