import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'path';

export default fp(async function (fastify) {
  // Serve static files from public directory
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/public/'
  });
});
