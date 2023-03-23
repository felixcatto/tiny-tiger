import { FastifyInstance } from 'fastify';
import path from 'path';
import { ssrRoutes } from '../lib/ssrRoutes.js';
import { importFresh, modes, supressConsoleLog } from '../lib/utils.js';

export const ssrRender = async (app: FastifyInstance) => {
  const { template, objection, pathPublic, mode } = app;

  app.get('/*', async (req, reply) => {
    const { currentUser, url } = req;

    let ssrData = {};
    const ssrRoute = ssrRoutes[url];
    if (ssrRoute) {
      ssrData = await ssrRoute({ objection });
    }

    let app;
    if (mode === modes.development) {
      app = await importFresh(path.resolve(pathPublic, 'js/appSSR.js'));
    } else {
      app = await import(path.resolve(pathPublic, 'js/appSSR.js'));
    }

    const initialState = { currentUser, fallback: ssrData };
    const renderedComponent = supressConsoleLog(() => app.renderToString(req.url, initialState));

    const html = template
      .replace('{{content}}', renderedComponent)
      .replace('{{initialState}}', JSON.stringify(initialState));

    reply.type('html').send(html);
  });
};
