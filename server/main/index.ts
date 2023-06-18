import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import fs from 'fs';
import makeKeygrip from 'keygrip';
import path from 'path';
import {
  dirname,
  isDevelopment,
  isProduction,
  loggerOptions,
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

  const app = fastify(loggerOptions(mode));

  const pathPublic = path.resolve(__dirname, '../public');
  const templatePath = isProduction(mode)
    ? path.resolve(pathPublic, 'index.html')
    : path.resolve(__dirname, '../../index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  app.decorate('orm', null);
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
