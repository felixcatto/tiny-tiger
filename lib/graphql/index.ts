import { gql } from 'graphql-request';
import { isArray, isNumber, isString } from 'lodash-es';
import {
  todoFilterSchema,
  todoPostGuestSchema,
  todoPostUserSchema,
  todoSortSchema,
} from '../../models/Todo.js';
import { IFSPSchema, IGqlCtx, ITodoPostGuestSchema, ITodoPostUserSchema } from '../types.js';
import {
  checkAdminGql,
  gqlMiddleware,
  isSignedIn,
  ivalidate,
  makeGqlErrors,
  paginationSchema,
  roles,
  validateGql,
} from '../utils.js';

export const schema = gql`
  type ITodo {
    id: Int!
    text: String!
    author_id: Int!
    is_completed: Boolean!
    is_edited_by_admin: Boolean!
    author: IUser
  }

  type IUser {
    id: Int!
    name: String!
    role: String!
    email: String!
    todos: [ITodo!]
  }

  type IGetTodos {
    rows: [ITodo!]!
    totalRows: Int!
  }

  type Query {
    getUsers(withTodos: Boolean): [IUser!]!
    getTodos(
      withAuthor: Boolean
      filters: String
      sortOrder: String
      sortBy: String
      page: Int
      size: Int
    ): IGetTodos
  }

  type Mutation {
    postTodos(text: String!, name: String, email: String, is_completed: Boolean): ITodo
    putTodos(id: Int!, text: String!, is_completed: Boolean): ITodo
    deleteTodos(id: Int!): Int
  }
`;

export const resolvers = {
  Query: {
    getUsers: async (_, args, ctx: IGqlCtx) => {
      const { withTodos } = args;
      const { User } = ctx.app.objection;
      const usersQuery = User.query();
      if (withTodos) {
        usersQuery.withGraphFetched('todos');
      }

      return usersQuery;
    },

    getTodos: gqlMiddleware([
      validateGql(paginationSchema.concat(todoSortSchema).concat(todoFilterSchema)),
      async (_, args, ctx: IGqlCtx) => {
        const { Todo } = ctx.app.objection;
        const { withAuthor } = args;
        const { sortOrder, sortBy, page, size, filters } = ctx.reply.request.vlBody as IFSPSchema;

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
          totalRowsQuery = todoQuery.clone().resultSize();
          todoQuery.offset(page * size).limit(size);
        }

        if (withAuthor) {
          todoQuery.withGraphJoined('author');
        }

        if (totalRowsQuery) {
          const [todos, totalRows] = await Promise.all([todoQuery, totalRowsQuery]);
          return { rows: todos, totalRows };
        } else {
          const todos = await todoQuery;
          return { rows: todos, totalRows: todos.length };
        }
      },
    ]),
  },

  Mutation: {
    postTodos: async (_, args, ctx: IGqlCtx) => {
      const { reply: res } = ctx;
      const { Todo, User } = ctx.app.objection;
      const { currentUser } = res.request;

      const isUserSignedIn = isSignedIn(currentUser);
      const [data, error] = isUserSignedIn
        ? ivalidate<ITodoPostUserSchema>(todoPostUserSchema, args)
        : ivalidate<ITodoPostGuestSchema>(todoPostGuestSchema, args);

      if (error) {
        return res.send(makeGqlErrors(error));
      }

      if (isUserSignedIn) {
        const todo = await Todo.query().insert({ ...data, author_id: currentUser.id });
        return todo;
      }

      const { email, name, ...todoFields } = data as ITodoPostGuestSchema;
      const user = await User.query().findOne({ name });
      if (user) {
        if (user.role !== roles.guest) {
          return res.send(makeGqlErrors({ name: 'name already exist' }));
        }

        const todo = await Todo.query().insert({ ...todoFields, author_id: user.id });
        return todo;
      } else {
        const newUser = await User.query().insert({ name, email, role: roles.guest });
        const todo = await Todo.query().insert({ ...todoFields, author_id: newUser.id });
        return todo;
      }
    },

    putTodos: gqlMiddleware([
      checkAdminGql,
      async (_, args, ctx: IGqlCtx) => {
        const { reply: res } = ctx;
        const { id, ...data } = args;
        const { Todo } = ctx.app.objection;

        const oldTodo = await Todo.query().findById(id);
        if (!oldTodo) {
          return res.send(makeGqlErrors({ message: 'Entity does not exist' }));
        }
        const newData = oldTodo.text === data.text ? data : { ...data, is_edited_by_admin: true };
        const todo = await Todo.query().updateAndFetchById(id, newData);
        return todo;
      },
    ]),

    deleteTodos: gqlMiddleware([
      checkAdminGql,
      async (_, args, ctx: IGqlCtx) => {
        const { id } = args;
        const { Todo } = ctx.app.objection;
        await Todo.query().deleteById(id);
        return id;
      },
    ]),
  },
};
