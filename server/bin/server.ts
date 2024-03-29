import * as Sentry from '@sentry/node';
import { loadEnv } from '../lib/utils.js';
import getApp from '../main/index.js';

loadEnv();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = Number(process.env.PORT);

const app = getApp();
app.listen({ port, host }, err => {
  if (err) {
    console.log(err);
  }
});
