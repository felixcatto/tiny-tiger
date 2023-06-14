import '../css/index.css'; // Import FIRST
// import { isProduction } from '../lib/utils.jsx';
// import * as Sentry from '@sentry/browser';
import { hydrateRoot } from 'react-dom/client';
import { App } from '../common/App.jsx';

// if (isProduction(import.meta.env.MODE)) {
//   Sentry.init({
//     dsn: import.meta.env.VITE_SENTRY_DSN,
//     integrations: [new Sentry.BrowserTracing()],
//     tracesSampleRate: 1.0,
//   });
// }

document.body.style.display = ''; // avoid FOUC in dev mode

hydrateRoot(document.getElementById('root')!, <App {...window.INITIAL_STATE} />);
