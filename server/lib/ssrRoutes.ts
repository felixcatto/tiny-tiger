import { isArray, isEmpty, isNumber, isString } from 'lodash-es';
import { todoFilterSchema, todoSortSchema } from '../models/Todo.js';
import { getGenericDataRoute } from './routerUtils.js';
import { IAnyObj, IFSPSchema, IOrm } from './types.js';
import { dataRoutes, ivalidate, paginationSchema, routes } from './utils.js';

type IOpts = {
  pathname: string;
  params: IAnyObj;
  query: IAnyObj;
  orm: IOrm;
};

type IGetRouteDataOpts = {
  url: string;
  orm: IOrm;
};

type IRouteLoaders = {
  [key in (typeof dataRoutes)[number]]: (opts: IOpts) => any;
};

export const getRouteData = async (opts: IGetRouteDataOpts) => {
  const { url, ...restOpts } = opts;
  const dataRoute = getGenericDataRoute(url, dataRoutes);
  if (!dataRoute) return {};

  const loadRouteData = routeLoaders[dataRoute.genericUrl];
  if (!loadRouteData) return {};

  return loadRouteData({ ...restOpts, params: dataRoute.params, query: dataRoute.query });
};

const routeLoaders: IRouteLoaders = {
  [routes.home]: async opts => {
    const { orm, query } = opts;
    const { Todo } = orm;
    const defaultQuery = { page: 0, size: 3 } as IFSPSchema;

    const querySchema = paginationSchema.concat(todoSortSchema).concat(todoFilterSchema);
    const [vlQuery, error] = ivalidate<IFSPSchema>(querySchema, query);
    if (error) return error;

    const computedQuery = isEmpty(vlQuery) ? defaultQuery : vlQuery;
    const { sortOrder, sortBy, page, size, filters } = computedQuery;

    let totalRowsQuery;
    const todoQuery = Todo.query();

    if (filters) {
      filters.forEach(el => {
        if (isArray(el.filter)) {
          todoQuery.whereIn(el.filterBy, el.filter);
        } else if (isString(el.filter)) {
          todoQuery.where(el.filterBy, 'ilike', `%${el.filter}%`);
        }
      });
    }

    if (sortOrder && sortBy) {
      todoQuery.orderBy(sortBy, sortOrder);
    } else {
      todoQuery.orderBy('id');
    }

    if (size && isNumber(page)) {
      totalRowsQuery = todoQuery.clone().joinRelated('author').resultSize();
      todoQuery.offset(page * size).limit(size);
    }

    todoQuery.withGraphJoined('author');

    if (totalRowsQuery) {
      const [todos, totalRows] = await Promise.all([todoQuery, totalRowsQuery]);
      return { rows: todos, totalRows };
    } else {
      const todos = await todoQuery;
      return { rows: todos, totalRows: todos.length };
    }
  },

  [routes.users]: async opts => {
    const { orm } = opts;
    const { User } = orm;
    const users = await User.query().withGraphFetched('todos');
    return { users };
  },

  [routes.user]: async opts => {
    const { orm, params } = opts;
    const { User } = orm;
    const { id } = params;
    const user = await User.query().findById(id);
    return { user };
  },
};
