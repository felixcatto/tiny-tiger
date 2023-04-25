import { configure } from '@testing-library/dom';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.development` });

configure({ testIdAttribute: 'data-test' });

global.ResizeObserver = function () {
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
};
