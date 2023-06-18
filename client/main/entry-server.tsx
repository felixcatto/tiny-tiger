import { renderToString } from 'react-dom/server';
import { Router } from '../lib/router.jsx';
import { App } from './App.jsx';

export const render = (routerProps, initialState) =>
  renderToString(
    <Router {...routerProps}>
      <App {...initialState} />
    </Router>
  );
