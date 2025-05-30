import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  async registerRoutes(fastify: FastifyInstance): Promise<void> {
    // GET /api/dashboard/overview - Get dashboard overview data
    fastify.get('/api/dashboard/overview', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const overview = await this.dashboardService.getOverviewData();
        
        return reply.send({
          success: true,
          data: overview,
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

    // GET /api/dashboard/real-time - Get real-time data
    fastify.get('/api/dashboard/real-time', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const realTimeData = await this.dashboardService.getRealTimeData();
        
        return reply.send({
          success: true,
          data: realTimeData,
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

    // GET /api/dashboard/health - Health check for dashboard
    fastify.get('/api/dashboard/health', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        return reply.send({
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date(),
            services: {
              queueManagement: 'online',
              iotData: 'online',
              predictions: 'pending' // Will be updated in Phase 3
            }
          },
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
