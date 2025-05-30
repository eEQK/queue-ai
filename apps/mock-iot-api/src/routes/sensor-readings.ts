import { FastifyInstance } from 'fastify';
import { ReadingGenerator } from '../data/reading-generator';
import { SENSOR_TYPES } from '../data/current-hour-readings';

export const sensorRoutes = async (fastify: FastifyInstance) => {
  const generator = new ReadingGenerator();
  
  // GET /api/sensors/patient-arrivals/next
  fastify.get('/api/sensors/patient-arrivals/next', async (request, reply) => {
    const reading = generator.getNextReading('patientArrivals');
    if (!reading) {
      return reply.code(204).send(); // No more data for current hour
    }
    return reading;
  });
  
  // GET /api/sensors/wait-times/next
  fastify.get('/api/sensors/wait-times/next', async (request, reply) => {
    const reading = generator.getNextReading('waitTimes');
    if (!reading) {
      return reply.code(204).send();
    }
    return reading;
  });
  
  // GET /api/sensors/room-occupancy/next
  fastify.get('/api/sensors/room-occupancy/next', async (request, reply) => {
    const reading = generator.getNextReading('roomOccupancy');
    if (!reading) {
      return reply.code(204).send();
    }
    return reading;
  });
  
  // GET /api/sensors/staff-availability/next
  fastify.get('/api/sensors/staff-availability/next', async (request, reply) => {
    const reading = generator.getNextReading('staffAvailability');
    if (!reading) {
      return reply.code(204).send();
    }
    return reading;
  });
  
  // GET /api/sensors/status - Get status of all sensors
  fastify.get('/api/sensors/status', async (request, reply) => {
    const status = generator.getStatus();
    return {
      timestamp: new Date().toISOString(),
      sensors: status,
      availableSensorTypes: SENSOR_TYPES
    };
  });
  
  // POST /api/sensors/reset - Reset all sensors to beginning of current hour (for testing)
  fastify.post('/api/sensors/reset', async (request, reply) => {
    generator.reset();
    return { 
      message: 'All sensor readings reset to beginning of current hour',
      timestamp: new Date().toISOString(),
      status: generator.getStatus()
    };
  });
  
  // GET /api/sensors - List all available sensor endpoints
  fastify.get('/api/sensors', async (request, reply) => {
    return {
      message: 'Mock IoT API - Available Sensor Endpoints',
      timestamp: new Date().toISOString(),
      endpoints: {
        'GET /api/sensors/patient-arrivals/next': 'Get next patient arrival reading',
        'GET /api/sensors/wait-times/next': 'Get next wait time reading',
        'GET /api/sensors/room-occupancy/next': 'Get next room occupancy reading',
        'GET /api/sensors/staff-availability/next': 'Get next staff availability reading',
        'GET /api/sensors/status': 'Get status of all sensors',
        'POST /api/sensors/reset': 'Reset all sensors to beginning of current hour',
        'GET /api/sensors': 'List all available endpoints'
      },
      currentStatus: generator.getStatus()
    };
  });
};
