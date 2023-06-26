import { match } from 'path-to-regexp';
import { IGetGenericDataRoute, IMakeEnum } from '../../client/lib/routerTypes.js';

const makeEnum: IMakeEnum = (...args) =>
  args.reduce((acc, key) => ({ ...acc, [key]: key }), {} as any);

export const asyncStates = makeEnum('idle', 'pending', 'resolved', 'rejected');

export const isBrowser = () => typeof window !== 'undefined';

export const qs = {
  parse: queryString => {
    if (!queryString) return {};
    const queryParts = queryString
      .split('&')
      .map(pair => pair.split('=').map(el => decodeURIComponent(el)));

    return queryParts.reduce((acc, queryPart) => ({ ...acc, [queryPart[0]]: queryPart[1] }), {});
  },

  getPathname: url => url.split('?')[0],

  splitUrl: url => {
    const [pathname, rawQuery] = url.split('?');
    const query = qs.parse(rawQuery);
    return { pathname, query };
  },
};

export const getGenericDataRoute: IGetGenericDataRoute = (url, dataRoutes) => {
  const { pathname, query } = qs.splitUrl(url);
  let matchedRoute = null as any;

  for (let i = 0; i < dataRoutes.length; i++) {
    const genericRoutePathname = dataRoutes[i];
    const isMatched = match(genericRoutePathname)(pathname);
    if (isMatched) {
      matchedRoute = {
        url,
        genericUrl: genericRoutePathname,
        params: isMatched.params,
        query,
      };
      break;
    }
  }

  return matchedRoute;
};
