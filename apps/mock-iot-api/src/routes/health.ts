import { FastifyInstance } from 'fastify';

export const healthRoutes = async (fastify: FastifyInstance) => {
  // GET /api/health
  fastify.get('/api/health', async (request, reply) => {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Mock IoT API is running',
      service: 'mock-iot-api',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  });
  
  // GET /health (alternative endpoint)
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mock-iot-api'
    };
  });
};
