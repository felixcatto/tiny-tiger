import '../css/index.css'; // Import FIRST
// import * as Sentry from '@sentry/browser';
import { hydrateRoot } from 'react-dom/client';
import { Router } from 'wouter';
// import { isProduction } from '../lib/utils.jsx';
import { App } from './app';
import '../css/tailwind.css'; // Import LAST

// if (isProduction(import.meta.env.MODE)) {
//   Sentry.init({
//     dsn: import.meta.env.VITE_SENTRY_DSN,
//     integrations: [new Sentry.BrowserTracing()],
//     tracesSampleRate: 1.0,
//   });
// }

document.body.style.display = ''; // avoid FOUC in dev mode
const initialState = (window as any).INITIAL_STATE;

hydrateRoot(
  document.getElementById('root')!,
  <Router>
    <App initialState={initialState} />
  </Router>
);
