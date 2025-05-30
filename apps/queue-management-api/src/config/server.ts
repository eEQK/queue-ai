export interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'test';
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  mockIoTApiUrl: string;
  iotPollingInterval: number; // milliseconds
}

export const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  environment: (process.env.NODE_ENV as ServerConfig['environment']) || 'development',
  logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || 'info',
  mockIoTApiUrl: process.env.MOCK_IOT_API_URL || 'http://localhost:3001',
  iotPollingInterval: parseInt(process.env.IOT_POLLING_INTERVAL || '30000') // 30 seconds
};
