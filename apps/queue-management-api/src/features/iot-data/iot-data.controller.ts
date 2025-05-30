import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IoTDataService } from './iot-data.service.js';
import { ProcessSensorReadingRequest } from './iot-data.types.js';

export class IoTDataController {
  constructor(private iotDataService: IoTDataService) {}

  async registerRoutes(fastify: FastifyInstance): Promise<void> {
    // POST /api/iot/sensor-data - Process new sensor reading
    fastify.post<{
      Body: ProcessSensorReadingRequest
    }>('/api/iot/sensor-data', async (request: FastifyRequest<{
      Body: ProcessSensorReadingRequest
    }>, reply: FastifyReply) => {
      try {
        const reading = await this.iotDataService.processSensorReading(request.body);
        
        return reply.code(201).send({
          success: true,
          data: reading,
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

    // GET /api/iot/sensors - Get all sensor summaries
    fastify.get('/api/iot/sensors', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const summaries = await this.iotDataService.getSensorSummaries();
        
        return reply.send({
          success: true,
          data: summaries,
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

    // GET /api/iot/sensor-status - Get sensor health status
    fastify.get('/api/iot/sensor-status', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const health = await this.iotDataService.getSensorHealth();
        
        return reply.send({
          success: true,
          data: health,
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

    // GET /api/iot/system-health - Get overall IoT system health
    fastify.get('/api/iot/system-health', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const systemHealth = await this.iotDataService.getSystemHealth();
        
        return reply.send({
          success: true,
          data: systemHealth,
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

    // GET /api/iot/readings/:sensorType - Get readings by sensor type
    fastify.get<{
      Params: { sensorType: string }
      Querystring: { hours?: string }
    }>('/api/iot/readings/:sensorType', async (request: FastifyRequest<{
      Params: { sensorType: string }
      Querystring: { hours?: string }
    }>, reply: FastifyReply) => {
      try {
        const { sensorType } = request.params;
        const hours = request.query.hours ? parseInt(request.query.hours) : 24;
        
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
        
        const readings = await this.iotDataService.getSensorReadingsByType(sensorType, hours);
        
        return reply.send({
          success: true,
          data: readings,
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

    // POST /api/iot/start-polling - Start IoT data polling
    fastify.post('/api/iot/start-polling', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await this.iotDataService.startPolling();
        
        return reply.send({
          success: true,
          data: { message: 'IoT data polling started' },
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

    // POST /api/iot/stop-polling - Stop IoT data polling
    fastify.post('/api/iot/stop-polling', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        this.iotDataService.stopPolling();
        
        return reply.send({
          success: true,
          data: { message: 'IoT data polling stopped' },
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

    // POST /api/iot/generate-historical-data - Generate synthetic historical data
    fastify.post<{
      Body: { hours?: number }
    }>('/api/iot/generate-historical-data', async (request: FastifyRequest<{
      Body: { hours?: number }
    }>, reply: FastifyReply) => {
      try {
        const hours = request.body?.hours || 24;
        
        if (hours <= 0 || hours > 168) {
          return reply.code(400).send({
            success: false,
            error: 'Hours must be between 1 and 168 (7 days)',
            timestamp: new Date()
          });
        }

        await this.iotDataService.generateSyntheticHistoricalData(hours);
        
        return reply.send({
          success: true,
          data: { 
            message: `Generated ${hours} hours of synthetic historical data`,
            hoursGenerated: hours
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
