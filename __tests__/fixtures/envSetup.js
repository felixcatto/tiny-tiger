import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.development` });

global.ResizeObserver = function () {
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
};
