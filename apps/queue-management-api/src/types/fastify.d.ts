// Type declarations for Fastify app
declare module 'fastify' {
  interface FastifyInstance {
    serviceContainer: import('./shared/utils/service-container.js').ServiceContainer;
  }
}
