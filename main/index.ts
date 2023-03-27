import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import fs from 'fs';
import makeKeygrip from 'keygrip';
import path from 'path';
import { dirname, modes, objectionPlugin, vitePlugin } from '../lib/utils.js';
import * as models from '../models/index.js';
import routes from '../routes/index.js';

const getApp = () => {
  const app = fastify({
    disableRequestLogging: true,
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss', ignore: 'reqId,pid,hostname' },
      },
    },
  });

  const mode = process.env.NODE_ENV;
  const isProduction = mode === modes.production;
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);

  const __dirname = dirname(import.meta.url);
  const pathPublic = path.resolve(__dirname, '../public');
  const template = isProduction
    ? fs.readFileSync(path.resolve(pathPublic, 'index.html'), 'utf8')
    : fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');

  app.decorate('objection', null);
  app.decorate('mode', mode);
  app.decorate('isProduction', isProduction);
  app.decorate('keygrip', keygrip);
  app.decorate('template', template);
  app.decorate('pathPublic', pathPublic);
  app.decorateRequest('vlBody', null);
  app.decorateRequest('vlQuery', null);
  app.decorateRequest('currentUser', null);

  if (isProduction) {
    app.register(fastifyStatic, { root: pathPublic, wildcard: false, index: false });
  } else {
    app.register(vitePlugin);
  }

  app.register(objectionPlugin, { models });
  app.register(routes);

  return app;
};

export default getApp;
