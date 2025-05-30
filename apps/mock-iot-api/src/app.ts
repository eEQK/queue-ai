import Fastify from 'fastify';
import cors from '@fastify/cors';
import { sensorRoutes } from './routes/sensor-readings';
import { healthRoutes } from './routes/health';

const fastify = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      }
    }
  }
});

const start = async () => {
  try {
    // Register CORS plugin
    await fastify.register(cors, {
      origin: true, // Allow all origins for development
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    });
    
    // Register routes
    await fastify.register(healthRoutes);
    await fastify.register(sensorRoutes);
    
    // Root endpoint
    fastify.get('/', async (request, reply) => {
      return {
        message: 'Mock IoT API for Emergency Room Queue System',
        timestamp: new Date().toISOString(),
        service: 'mock-iot-api',
        version: '1.0.0',
        description: 'Provides hardcoded sensor readings for current hour only',
        endpoints: {
          health: '/api/health',
          sensors: '/api/sensors',
          sensorStatus: '/api/sensors/status',
          resetSensors: 'POST /api/sensors/reset'
        },
        usage: 'Each sensor endpoint returns sequential readings. Call /api/sensors/reset to restart from beginning of hour.'
      };
    });
    
    // Start server
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 Mock IoT API server running on http://${host}:${port}`);
    console.log(`📊 Health check: http://${host}:${port}/api/health`);
    console.log(`🔌 Sensor endpoints: http://${host}:${port}/api/sensors`);
    console.log(`⏰ Serving hardcoded readings for current hour only`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    try {
      await fastify.close();
      console.log('✅ Mock IoT API server closed successfully');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });
});

// Start the server
start();
