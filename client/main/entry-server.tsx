import { renderToString } from 'react-dom/server';
import { Router } from 'wouter';
import { App } from './app.js';

export const render = (url, initialState) =>
  renderToString(
    <Router ssrPath={url}>
      <App initialState={initialState} />
    </Router>
  );
