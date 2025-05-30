import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async function (fastify) {
  await fastify.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173', // Vite dev server
      'http://localhost:4173'  // Vite preview
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
});
