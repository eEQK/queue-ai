import { buildApp } from '../app.js';

async function startServer() {
  try {
    const fastify = await buildApp();
    
    await fastify.listen({ 
      port: 3000, 
      host: '0.0.0.0' 
    });
    
    console.log('🚀 Queue Management API server started successfully');
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

startServer();
