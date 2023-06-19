import { FastifyInstance } from 'fastify';
import mercurius from 'mercurius';
import { resolvers, schema } from '../lib/graphql/index.js';
import { currentUserPlugin, isDevelopment, loggerPlugin, sentryPlugin } from '../lib/utils.js';
import session from './session.js';
import { routeData, ssrRender } from './ssr.js';
import todos from './todos.js';
import users from './users.js';

export default async (app: FastifyInstance) => {
  app.register(currentUserPlugin);
  app.register(loggerPlugin);
  app.register(sentryPlugin);

  const controllers = [routeData, session, todos, users];
  controllers.forEach(route => app.register(route, { prefix: '/api' }));
  app.all('/api/*', async (req, reply) => reply.code(404).send({ message: 'not found' }));

  app.register(mercurius, {
    schema,
    resolvers,
    graphiql: isDevelopment(app.mode),
  });

  app.register(ssrRender);
};
