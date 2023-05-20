import { isEmpty, keyBy } from 'lodash-es';
import { compile, match } from 'path-to-regexp';
import {
  IGqlApi,
  IMakeEnum,
  IMakeUrlFor,
  IPrefetchRoute,
  IResolvedPrefetchRoute,
} from './types.js';

export const qs = {
  stringify: (obj = {}) => {
    if (isEmpty(obj)) return '';
    return Object.keys(obj)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },
};

export const makeUrlFor: IMakeUrlFor = rawRoutes => {
  const routes = Object.keys(rawRoutes).reduce(
    (acc, name) => ({ ...acc, [name]: compile(rawRoutes[name]) }),
    {} as any
  );

  return (name, routeParams = {}, query = {}) => {
    const toPath = routes[name];
    return isEmpty(query) ? toPath(routeParams) : `${toPath(routeParams)}?${qs.stringify(query)}`;
  };
};

export const routes = {
  home: '/',
  users: '/users',
  user: '/users/:id',
  todos: '/todos',
  todo: '/todos/:id',
  newTodo: '/todos/new',
  editTodo: '/todos/:id/edit',
  session: '/session',
  newSession: '/session/new',
};

export const getUrl = makeUrlFor(routes);
export const getApiUrl = (name: keyof typeof routes, routeParams?, query?) =>
  `/api${getUrl(name, routeParams, query)}`;

export const prefetchRoutes = keyBy(
  [
    {
      genericRouteUrl: routes.home,
      swrRequestKey: getApiUrl('todos', {}, { page: 0, size: 3 }),
    },
    {
      genericRouteUrl: routes.users,
      swrRequestKey: getApiUrl('users', {}, { withTodos: true }),
    },
    {
      genericRouteUrl: routes.user,
      getSwrRequestKey: params => getApiUrl('user', params),
    },
  ],
  'genericRouteUrl'
) as Record<string, IPrefetchRoute>;

export const getPrefetchRouteByHref = href => {
  let prefetchRoute = null as IResolvedPrefetchRoute | null;
  const routes = Object.values(prefetchRoutes);

  for (let i = 0; i < routes.length; i++) {
    const testRoute = routes[i];
    const isRouteDynamic = testRoute.getSwrRequestKey;

    if (isRouteDynamic) {
      const isMatched = match(testRoute.genericRouteUrl)(href);
      if (isMatched) {
        prefetchRoute = {
          genericRouteUrl: testRoute.genericRouteUrl,
          swrRequestKey: testRoute.getSwrRequestKey(isMatched.params, href),
          params: isMatched.params,
        };
        break;
      }
    } else {
      const isMatched = testRoute.genericRouteUrl === href;
      if (isMatched) {
        prefetchRoute = { ...testRoute, params: {} };
        break;
      }
    }
  }

  return prefetchRoute;
};

export const makeEnum: IMakeEnum = (...args) =>
  args.reduce((acc, key) => ({ ...acc, [key]: key }), {} as any);

export const roles = makeEnum('user', 'admin', 'guest');
export const asyncStates = makeEnum('idle', 'pending', 'resolved', 'rejected');
export const sortOrders = makeEnum('asc', 'desc');
export const filterTypes = makeEnum('search', 'select');
export const modes = makeEnum('test', 'development', 'production');
export const apiTypes = makeEnum('rest', 'graphql');

export const guestUser = {
  id: -111,
  name: 'Guest',
  role: roles.guest,
  email: '',
  password_digest: '',
} as const;

export const isBrowser = () => typeof window !== 'undefined';

export const isSignedIn = currentUser => currentUser.role !== roles.guest;
export const isAdmin = currentUser => currentUser.role === roles.admin;

export const isProduction = mode => mode === modes.production;
export const isDevelopment = mode => mode === modes.development;
export const isTest = mode => mode === modes.test;

export const gqlApi: IGqlApi = { method: 'post', url: 'graphql' };
export const makeGqlPayload = (query, variables?) => ({ query, variables });
