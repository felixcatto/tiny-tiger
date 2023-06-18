import { configure } from '@testing-library/dom';
import { loadEnv } from '../../devUtils.js';

loadEnv({ useEnvConfig: 'development', isSilent: true });

configure({ testIdAttribute: 'data-test' });

global.ResizeObserver = function () {
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
};
