import path from 'path';
import fs from 'fs';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { dirname } from '../lib/utils.js';

const app = fastify();
const __dirname = dirname(import.meta.url);
const pathPublic = path.resolve(__dirname, '../public');
const template = fs.readFileSync(path.resolve(__dirname, pathPublic, 'html/index.html'), 'utf8');

app.register(fastifyStatic, { root: pathPublic, wildcard: false });
app.register(async app => {
  app.get('/*', async (req, reply) => {
    reply.type('html').send(template);
  });
});

app.listen({ port: 3000, host: 'localhost' }, (err, address) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server listening on ${address}`);
  }
});
