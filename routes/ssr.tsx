import { FastifyInstance } from 'fastify';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { App } from '../client/main/app.js';
import { ssrRoutes } from '../lib/ssrRoutes.js';
import { supressConsoleLog } from '../lib/utils.js';

export const ssrRender = async (app: FastifyInstance) => {
  const { template, objection } = app;

  app.get('/*', async (req, reply) => {
    const { currentUser, url } = req;

    let ssrData = {};
    const ssrRoute = ssrRoutes[url];
    if (ssrRoute) {
      ssrData = await ssrRoute({ objection });
    }

    const initialState = { currentUser, fallback: ssrData };

    const renderedComponent = supressConsoleLog(() =>
      renderToString(
        <Router hook={staticLocationHook(req.url)}>
          <App initialState={initialState} />
        </Router>
      )
    );

    const html = template
      .replace('{{content}}', renderedComponent)
      .replace('{{initialState}}', JSON.stringify(initialState));

    reply.type('html').send(html);
  });
};
