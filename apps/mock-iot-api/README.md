# Mock IoT API

A disposable mock service that provides hardcoded sensor readings for the Emergency Room Queue System. This API serves sequential sensor data for the current hour only, simulating real-time IoT sensor behavior.

## Features

- **Hardcoded Current Hour Data**: Returns realistic emergency room sensor readings for the current hour only
- **Sequential Reading Access**: Each API call returns the next reading in sequence
- **Multiple Sensor Types**: Patient arrivals, wait times, room occupancy, and staff availability
- **Reset Functionality**: Ability to reset all sensors to beginning of current hour
- **Health Monitoring**: Health check endpoints for system monitoring
- **CORS Enabled**: Allows cross-origin requests for development

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start production server
bun run start

# Run tests
bun run test
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health & Status

- `GET /api/health` - Health check endpoint
- `GET /health` - Alternative health check
- `GET /` - Root endpoint with API information
- `GET /api/sensors` - List all available sensor endpoints
- `GET /api/sensors/status` - Get status of all sensors (current index, total readings)

### Sensor Data

- `GET /api/sensors/patient-arrivals/next` - Get next patient arrival reading
- `GET /api/sensors/wait-times/next` - Get next wait time reading  
- `GET /api/sensors/room-occupancy/next` - Get next room occupancy reading
- `GET /api/sensors/staff-availability/next` - Get next staff availability reading

### Management

- `POST /api/sensors/reset` - Reset all sensors to beginning of current hour

## Response Formats

### Successful Sensor Reading
```json
{
  "sensorId": "patientArrivals-sensor-001",
  "sensorType": "patientArrivals",
  "timestamp": "2025-05-30T22:00:00.000Z",
  "value": 2,
  "metadata": {
    "readingIndex": 0,
    "totalReadings": 12,
    "hasMoreReadings": true
  }
}
```

### No More Readings Available
- HTTP Status: `204 No Content`
- Empty response body

### Health Check Response
```json
{
  "status": "ok",
  "timestamp": "2025-05-30T22:04:56.976Z",
  "message": "Mock IoT API is running",
  "service": "mock-iot-api",
  "version": "1.0.0",
  "uptime": 10.798810125,
  "environment": "development"
}
```

## Sensor Data Types

### Patient Arrivals
- **Value**: Number of patients arriving in 5-minute interval
- **Range**: 0-4 patients
- **Pattern**: Realistic arrival patterns with varying intensity

### Wait Times  
- **Value**: Average wait time in minutes
- **Range**: 45-65 minutes
- **Pattern**: Gradually increasing with some variation

### Room Occupancy
- **Value**: Number of occupied rooms
- **Range**: 12-20 rooms
- **Pattern**: Gradually filling up as day progresses

### Staff Availability
- **Value**: Number of available staff members
- **Range**: 5-8 staff
- **Pattern**: Decreasing availability as day gets busier

## Current Hour Data Generation

The API generates timestamps for the current hour in 5-minute intervals:
- Starts from beginning of current hour (e.g., 22:00:00)
- Creates readings every 5 minutes up to current time
- Maximum 12 readings per hour (60 minutes ÷ 5 minutes)

## Usage Examples

```bash
# Get health status
curl http://localhost:3001/api/health

# List all available endpoints
curl http://localhost:3001/api/sensors

# Get next patient arrival reading
curl http://localhost:3001/api/sensors/patient-arrivals/next

# Get sensor status
curl http://localhost:3001/api/sensors/status

# Reset all sensors
curl -X POST http://localhost:3001/api/sensors/reset

# Test all endpoints
bun run test
```

## Development

### Project Structure
```
src/
├── app.ts                      # Main Fastify application
├── test-api.ts                # Comprehensive test script
├── data/
│   ├── current-hour-readings.ts   # Hardcoded sensor data
│   └── reading-generator.ts       # Sequential reading logic
└── routes/
    ├── health.ts              # Health check endpoints
    └── sensor-readings.ts     # Sensor data endpoints
```

### Environment Variables
```env
PORT=3001
NODE_ENV=development
HOST=0.0.0.0
```

### Scripts
- `bun run dev` - Start with file watching
- `bun run start` - Start production server
- `bun run build` - Build for production
- `bun run type-check` - TypeScript type checking
- `bun run test` - Run API endpoint tests

## Integration with Main API

The main queue management API will use the `MockIoTClient` to poll this API:

```typescript
const client = new MockIoTClient('http://localhost:3001');
const reading = await client.getNextPatientArrival();
```

## Important Notes

- **Disposable Service**: This is a temporary mock service for development
- **Current Hour Only**: Only provides data for the current hour
- **Sequential Access**: Each endpoint call advances to next reading
- **No Persistence**: Data resets when server restarts
- **Development Only**: Not intended for production use

## Testing

The included test script verifies:
- All endpoints return expected responses
- Sequential reading functionality works correctly
- Reset functionality restores readings
- Proper HTTP status codes (200, 204)
- Error handling for exhausted readings

Run tests with: `bun run test`

## Phase 1 Complete

This mock IoT API serves as the foundation for the Emergency Room Queue System, providing:
✅ Hardcoded readings for current hour only  
✅ Sequential reading endpoints  
✅ Simple health check endpoint  
✅ Complete independence from main API  
✅ Verified functionality through comprehensive testing
