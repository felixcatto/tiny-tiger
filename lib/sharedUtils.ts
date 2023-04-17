import { isEmpty } from 'lodash-es';
import { compile } from 'path-to-regexp';
import { IMakeEnum, IMakeUrlFor } from './types.js';

export const makeEnum: IMakeEnum = (...args) =>
  args.reduce((acc, key) => ({ ...acc, [key]: key }), {} as any);

export const roles = makeEnum('user', 'admin', 'guest');
export const asyncStates = makeEnum('idle', 'pending', 'resolved', 'rejected');
export const sortOrders = makeEnum('asc', 'desc');
export const filterTypes = makeEnum('search', 'select');
export const modes = makeEnum('test', 'development', 'production');

export const isSignedIn = currentUser => currentUser.role !== roles.guest;
export const isAdmin = currentUser => currentUser.role === roles.admin;

export const guestUser = {
  id: -111,
  name: 'Guest',
  role: roles.guest,
  email: '',
  password_digest: '',
} as const;

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

export const isBrowser = () => typeof window !== 'undefined';
