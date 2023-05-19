import { IOrm } from './types.js';
import { getPrefetchRouteByHref, routes } from './utils.js';

export const getSSRData = async (url, opts) => {
  const ssrRoute = getPrefetchRouteByHref(url);
  if (!ssrRoute) return {};

  const routeFetcher = ssrRouteFetchers[ssrRoute.genericRouteUrl];
  if (!routeFetcher) return {};

  const ssrData = await routeFetcher({ ...opts, params: ssrRoute.params });
  return { [ssrRoute.swrRequestKey]: ssrData };
};

export const ssrRouteFetchers = {
  [routes.home]: async opts => {
    const { orm } = opts;
    const { Todo } = orm as IOrm;
    const page = 0;
    const size = 3;

    const totalRowsQuery = Todo.query().resultSize();
    const todoQuery = Todo.query()
      .withGraphJoined('author')
      .offset(page * size)
      .limit(size)
      .orderBy('id');
    const [todos, totalRows] = await Promise.all([todoQuery, totalRowsQuery]);

    return { rows: todos, totalRows };
  },

  [routes.users]: async opts => {
    const { orm } = opts;
    const { User } = orm as IOrm;
    return User.query().withGraphFetched('todos');
  },

  [routes.user]: async opts => {
    const { orm, params } = opts;
    const { User } = orm as IOrm;
    const { id } = params;
    return User.query().findById(id);
  },
};
