import { FastifyInstance } from 'fastify';
import { getLoaderData } from '../lib/ssrRoutes.js';
import { ILoaderDataSchema } from '../lib/types.js';
import {
  getUrl,
  isDevelopment,
  isProduction,
  loaderDataSchema,
  qs,
  supressConsoleLog,
  validate,
} from '../lib/utils.js';

export const ssrRender = async (app: FastifyInstance) => {
  const { mode, vite, orm, template: rawTemplate } = app;

  app.get('/*', async (req, reply) => {
    const { currentUser, url } = req;
    let template = rawTemplate;
    let appHtml;

    const { pathname, query } = qs.splitUrl(url);
    const loaderData = await getLoaderData({ pathname, query, orm });
    const initialState = { currentUser, query, loaderData };

    if (isProduction(mode)) {
      // @ts-ignore
      const { render } = await import('../server/entry-server.js');
      appHtml = supressConsoleLog(() => render(pathname, initialState));
    } else if (isDevelopment(mode)) {
      template = await vite.transformIndexHtml(pathname, template);
      template = template.replace('<body>', '<body style="display: none">'); // avoid FOUC in dev mode
      const { render } = await vite.ssrLoadModule('/client/main/entry-server.tsx');
      try {
        appHtml = supressConsoleLog(() => render(pathname, initialState));
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

export const loaderData = async (app: FastifyInstance) => {
  const { orm } = app;

  app.get(
    getUrl('loaderData'),
    { preHandler: validate(loaderDataSchema, 'query') },
    async (req, reply) => {
      const { url } = req.vlQuery as ILoaderDataSchema;
      const { pathname, query } = qs.splitUrl(url);
      const loaderData = await getLoaderData({ orm, pathname, query });
      reply.send(loaderData);
    }
  );
};
