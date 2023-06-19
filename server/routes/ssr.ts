import { FastifyInstance } from 'fastify';
import path from 'path';
import { IRouterProps } from '../../client/lib/routerTypes.js';
import { getRouteData } from '../lib/ssrRoutes.js';
import { IInitialState, IRouteDataSchema } from '../lib/types.js';
import {
  dataRoutes,
  getUrl,
  isDevelopment,
  isProduction,
  qs,
  routeDataSchema,
  supressConsoleLog,
  validate,
} from '../lib/utils.js';

export const ssrRender = async (app: FastifyInstance) => {
  const { mode, vite, orm, pathPublic, template: rawTemplate } = app;

  app.get('/*', async (req, reply) => {
    const { currentUser, url } = req;
    let template = rawTemplate;
    let appHtml;

    const { pathname, query } = qs.splitUrl(url);
    const routeData = await getRouteData({ orm, url });
    const routerProps: IRouterProps = { routeData, pathname, query, dataRoutes };
    const initialState: IInitialState = { routeData, currentUser };

    if (isProduction(mode)) {
      const serverEntryPath = path.resolve(pathPublic, 'server/entry-server.js');
      const { render } = await import(serverEntryPath);
      appHtml = supressConsoleLog(() => render(routerProps, initialState));
    } else if (isDevelopment(mode)) {
      template = await vite.transformIndexHtml(pathname, template);
      template = template.replace('<body>', '<body style="display: none">'); // avoid FOUC in dev mode
      const { render } = await vite.ssrLoadModule('/client/main/entry-server.tsx');
      try {
        appHtml = supressConsoleLog(() => render(routerProps, initialState));
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.log(e.stack);
        return reply.code(500).send(e.stack);
      }
    }

    const html = template
      .replace('{{content}}', appHtml)
      .replace('{{initialState}}', JSON.stringify(initialState));

    reply.type('html').send(html);
  });
};

export const routeData = async (app: FastifyInstance) => {
  const { orm } = app;

  app.get(
    getUrl('routeData'),
    { preHandler: validate(routeDataSchema, 'query') },
    async (req, reply) => {
      const { url } = req.vlQuery as IRouteDataSchema;
      const routeData = await getRouteData({ orm, url });
      reply.send(routeData);
    }
  );
};
