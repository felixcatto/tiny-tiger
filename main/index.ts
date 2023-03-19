import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import fs from 'fs';
import makeKeygrip from 'keygrip';
import path from 'path';
import { dirname, objectionPlugin } from '../lib/utils.js';
import * as models from '../models/index.js';
import routes from '../routes/index.js';

const getApp = () => {
  const app = fastify();
  const __dirname = dirname(import.meta.url);
  const pathPublic = path.resolve(__dirname, '../public');
  const template = fs.readFileSync(path.resolve(__dirname, pathPublic, 'html/index.html'), 'utf8');

  const mode = process.env.NODE_ENV || 'development';
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);

  app.decorate('objection', null);
  app.decorate('mode', mode);
  app.decorate('keygrip', keygrip);
  app.decorate('template', template);
  app.decorateRequest('vlBody', null);
  app.decorateRequest('vlQuery', null);
  app.decorateRequest('currentUser', null);

  app.register(objectionPlugin, { models });
  app.register(fastifyStatic, { root: pathPublic, wildcard: false });
  app.register(fastifyStatic, { root: `${pathPublic}/js`, prefix: '/js/', decorateReply: false });
  app.register(fastifyStatic, { root: `${pathPublic}/css`, prefix: '/css/', decorateReply: false });
  app.register(routes);

  return app;
};

export default getApp;
