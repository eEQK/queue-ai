import { IDataRepository } from '../repositories/repository.interface.js';
import { InMemoryDataRepository } from '../repositories/in-memory-data.repository.js';

export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerDefaultServices();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found in container`);
    }
    return service as T;
  }

  has(key: string): boolean {
    return this.services.has(key);
  }

  private registerDefaultServices(): void {
    // Register default repository implementation
    this.register<IDataRepository>('dataRepository', new InMemoryDataRepository());
  }
}

// Service keys for type safety
export const SERVICE_KEYS = {
  DATA_REPOSITORY: 'dataRepository',
  MOCK_IOT_CLIENT: 'mockIoTClient',
  CHRONOS_PREDICTION_SERVICE: 'chronosPredictionService'
} as const;
