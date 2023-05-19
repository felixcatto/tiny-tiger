import { FastifyInstance } from 'fastify';
import { getSSRData } from '../lib/ssrRoutes.js';
import { isDevelopment, isProduction, supressConsoleLog } from '../lib/utils.js';

export const ssrRender = async (app: FastifyInstance) => {
  const { mode, vite, orm, template: rawTemplate } = app;

  app.get('/*', async (req, reply) => {
    const { currentUser, url } = req;
    let template = rawTemplate;
    let appHtml;

    const ssrData = await getSSRData(url, { orm });
    const initialState = { currentUser, fallback: ssrData };

    if (isProduction(mode)) {
      // @ts-ignore
      const { render } = await import('../server/entry-server.js');
      appHtml = supressConsoleLog(() => render(url, initialState));
    } else if (isDevelopment(mode)) {
      template = await vite.transformIndexHtml(url, template);
      template = template.replace('<body>', '<body style="display: none">'); // avoid FOUC in dev mode
      const { render } = await vite.ssrLoadModule('/client/main/entry-server.tsx');
      try {
        appHtml = supressConsoleLog(() => render(url, initialState));
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
