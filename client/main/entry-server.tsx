import React from 'react';
import { renderToString } from 'react-dom/server';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { App } from './app.js';

export const render = (url, initialState) =>
  renderToString(
    <Router hook={staticLocationHook(url)}>
      <App initialState={initialState} />
    </Router>
  );
