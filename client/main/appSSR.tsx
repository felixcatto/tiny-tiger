import React from 'react';
import reactServer from 'react-dom/server';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { App } from './app.js';

export const renderToString = (url, initialState) =>
  reactServer.renderToString(
    <Router hook={staticLocationHook(url)}>
      <App initialState={initialState} />
    </Router>
  );
