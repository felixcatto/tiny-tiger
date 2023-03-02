import todos from './todos.js';
import session from './session.js';
import { FastifyInstance } from 'fastify';
import { currentUserPlugin } from '../lib/utils.js';

export default async (app: FastifyInstance) => {
  app.register(currentUserPlugin);
  const controllers = [session, todos];
  controllers.forEach(route => app.register(route, { prefix: '/api' }));
};
