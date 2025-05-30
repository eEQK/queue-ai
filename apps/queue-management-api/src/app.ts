import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { serverConfig } from './config/server.js';
import corsPlugin from './shared/plugins/cors.js';
import staticPlugin from './shared/plugins/static.js';

// Services and Controllers
import { ServiceContainer, SERVICE_KEYS } from './shared/utils/service-container.js';
import { MockIoTClient } from './shared/clients/mock-iot-client.js';
import { IDataRepository } from './shared/repositories/repository.interface.js';

// Features
import { QueueStatusController, QueueStatusService, QueueStatusRepository } from './features/queue-status/index.js';
import { IoTDataController, IoTDataService, IoTDataRepository } from './features/iot-data/index.js';
import { DashboardController, DashboardService } from './features/dashboard-api/index.js';
import { predictionRoutes } from './features/predictions/prediction.controller.js';
import { advancedPredictionRoutes } from './features/predictions/advanced-prediction.controller.js';

export async function buildApp() {
  // Create Fastify instance
  const app = fastify({
    logger: {
      level: serverConfig.logLevel
    }
  });

  // Register plugins
  await app.register(corsPlugin);
  await app.register(staticPlugin);

  // Initialize service container
  const container = ServiceContainer.getInstance();

  // Register additional services
  const mockIoTClient = new MockIoTClient({
    baseUrl: serverConfig.mockIoTApiUrl,
    timeout: 5000
  });
  container.register(SERVICE_KEYS.MOCK_IOT_CLIENT, mockIoTClient);

  // Get repository from container
  const dataRepository = container.get<IDataRepository>(SERVICE_KEYS.DATA_REPOSITORY);

  // Initialize repositories
  const queueStatusRepository = new QueueStatusRepository(dataRepository);
  const iotDataRepository = new IoTDataRepository(dataRepository);

  // Initialize services
  const queueStatusService = new QueueStatusService(queueStatusRepository);
  const iotDataService = new IoTDataService(
    iotDataRepository, 
    queueStatusService, 
    mockIoTClient,
    serverConfig.iotPollingInterval
  );
  const dashboardService = new DashboardService(queueStatusService, iotDataService);

  // Register repositories with service container for dependency injection
  container.register('queueStatusRepository', queueStatusRepository);

  // Make service container available to routes
  app.decorate('serviceContainer', container);

  // Initialize controllers
  const queueStatusController = new QueueStatusController(queueStatusService);
  const iotDataController = new IoTDataController(iotDataService);
  const dashboardController = new DashboardController(dashboardService);

  // Register routes
  await queueStatusController.registerRoutes(app);
  await iotDataController.registerRoutes(app);
  await dashboardController.registerRoutes(app);
  await app.register(predictionRoutes);
  await app.register(advancedPredictionRoutes);

  // Health check endpoint
  app.get('/api/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: serverConfig.environment,
      services: {
        queueManagement: 'online',
        iotData: 'online',
        mockIoTAPI: await mockIoTClient.checkHealth() ? 'online' : 'offline'
      }
    };
  });

  // Root endpoint
  app.get('/', async (request, reply) => {
    return {
      message: 'Emergency Room Queue Management API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        queue: '/api/queue/*',
        iot: '/api/iot/*',
        dashboard: '/api/dashboard/*',
        predictions: '/api/predictions/*',
        advancedPredictions: '/api/predictions/advanced/*'
      }
    };
  });
  
  // Generate synthetic historical data first
  console.log('Generating synthetic historical data...');
  await iotDataService.generateSyntheticHistoricalData(24);
  
  // Start IoT data polling automatically after data is generated
  await iotDataService.startPolling();

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    iotDataService.stopPolling();
    app.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  return app;
}

// Start server if this file is run directly
if (import.meta.main) {
  try {
    const app = await buildApp();
    
    await app.listen({ 
      port: serverConfig.port, 
      host: serverConfig.host 
    });
    
    console.log(`🚀 Queue Management API server running at http://${serverConfig.host}:${serverConfig.port}`);
    console.log(`📊 Environment: ${serverConfig.environment}`);
    console.log(`🔗 Mock IoT API: ${serverConfig.mockIoTApiUrl}`);
    console.log(`⏱️  IoT Polling Interval: ${serverConfig.iotPollingInterval}ms`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}
