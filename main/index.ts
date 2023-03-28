import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import fs from 'fs';
import makeKeygrip from 'keygrip';
import path from 'path';
import {
  dirname,
  isDevelopment,
  isProduction,
  isTest,
  modes,
  objectionPlugin,
  vitePlugin,
} from '../lib/utils.js';
import * as models from '../models/index.js';
import routes from '../routes/index.js';

const getApp = () => {
  const mode = process.env.NODE_ENV;
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);
  const __dirname = dirname(import.meta.url);
  const pathPublic = path.resolve(__dirname, '../public');

  const app = fastify({
    disableRequestLogging: true,
    logger: {
      level: isTest(mode) ? 'silent' : 'debug',
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss', ignore: 'reqId,pid,hostname' },
      },
    },
  });

  let templatePath;
  switch (mode) {
    case modes.production:
      templatePath = path.resolve(pathPublic, 'index.html');
      break;
    case modes.development:
      templatePath = path.resolve(__dirname, '../../index.html');
      break;
    case modes.test:
      templatePath = path.resolve(__dirname, '../index.html');
      break;
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  app.decorate('objection', null);
  app.decorate('mode', mode);
  app.decorate('keygrip', keygrip);
  app.decorate('template', template);
  app.decorate('pathPublic', pathPublic);
  app.decorateRequest('vlBody', null);
  app.decorateRequest('vlQuery', null);
  app.decorateRequest('currentUser', null);

  if (isProduction(mode)) {
    app.register(fastifyStatic, { root: pathPublic, wildcard: false, index: false });
  } else if (isDevelopment(mode)) {
    app.register(vitePlugin);
  }

  app.register(objectionPlugin, { models });
  app.register(routes);

  return app;
};

export default getApp;
