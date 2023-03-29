import { getApiUrl, getUrl } from './utils.js';
import { IObjection } from './types.js';

export const ssrRoutes = {
  [getUrl('home')]: async opts => {
    const { objection } = opts;
    const { Todo } = objection as IObjection;
    const page = 0;
    const size = 3;

    const totalRowsQuery = Todo.query().resultSize();
    const todoQuery = Todo.query()
      .withGraphJoined('author')
      .offset(page * size)
      .limit(size)
      .orderBy('id');
    const [todos, totalRows] = await Promise.all([todoQuery, totalRowsQuery]);

    return {
      [getApiUrl('todos', {}, { page, size })]: {
        rows: todos,
        totalRows,
      },
    };
  },
  [getUrl('users')]: async opts => {
    const { objection } = opts;
    const { User } = objection as IObjection;
    const users = await User.query();
    return { [getApiUrl('users')]: users };
  },
};
