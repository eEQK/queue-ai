// Hardcoded sensor readings for the current hour only
// Each sensor type contains readings from the beginning of the current hour to now

export interface SensorReading {
  timestamp: string;
  value: number;
}

export interface SensorData {
  sensorId: string;
  sensorType: string;
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

// Generate timestamps for current hour in 5-minute intervals
const getCurrentHourTimestamps = (): string[] => {
  const now = new Date();
  const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
  const timestamps: string[] = [];
  
  // Generate timestamps for full hour (0-60 minutes) to ensure we always have data
  // This simulates having historical data for the entire hour
  for (let minutes = 0; minutes < 60; minutes += 5) {
    const timestamp = new Date(currentHour.getTime() + minutes * 60 * 1000);
    timestamps.push(timestamp.toISOString());
  }
  
  return timestamps;
};

const timestamps = getCurrentHourTimestamps();

// Hardcoded readings for current hour - realistic emergency room data
export const CURRENT_HOUR_READINGS = {
  patientArrivals: timestamps.map((timestamp, index) => ({
    timestamp,
    value: [2, 1, 3, 0, 2, 1, 4, 2, 1, 3, 2, 0][index % 12] || 1 // Realistic arrival pattern
  })),
  
  waitTimes: timestamps.map((timestamp, index) => ({
    timestamp,
    value: 45 + (index * 3) + Math.floor(Math.sin(index) * 5) // Gradually increasing with some variation
  })),
  
  roomOccupancy: timestamps.map((timestamp, index) => ({
    timestamp,
    value: Math.min(20, 12 + Math.floor(index / 2)) // Gradually filling up, max 20 rooms
  })),
  
  staffAvailability: timestamps.map((timestamp, index) => ({
    timestamp,
    value: Math.max(5, 8 - Math.floor(index / 3)) // Staff getting busier as day progresses
  }))
};

// Export sensor types for validation
export const SENSOR_TYPES = ['patientArrivals', 'waitTimes', 'roomOccupancy', 'staffAvailability'] as const;
export type SensorType = typeof SENSOR_TYPES[number];
