import { FastifyInstance } from 'fastify';
import { isArray, isNumber, isString } from 'lodash-es';
import {
  IFSPSchema,
  ITodoPostGuestSchema,
  ITodoPostUserSchema,
  ITodoPutSchema,
} from '../lib/types.js';
import {
  checkAdmin,
  isSignedIn,
  ivalidate,
  makeErrors,
  paginationSchema,
  roles,
  validate,
} from '../lib/utils.js';
import {
  todoFilterSchema,
  todoPostGuestSchema,
  todoPostUserSchema,
  todoPutSchema,
  todoSortSchema,
} from '../models/Todo.js';

export default async (app: FastifyInstance) => {
  const { User, Todo } = app.orm;
  const querySchema = paginationSchema.concat(todoSortSchema).concat(todoFilterSchema);

  app.get('/todos', { preHandler: validate(querySchema, 'query') }, async (req, res) => {
    const { sortOrder, sortBy, page, size, filters } = req.vlQuery as IFSPSchema;

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
      res.code(200).send({ rows: todos, totalRows });
    } else {
      const todos = await todoQuery;
      res.code(200).send({ rows: todos, totalRows: todos.length });
    }
  });

  app.post('/todos', async (req, res) => {
    const { currentUser } = req;
    const isUserSignedIn = isSignedIn(req.currentUser);
    const [data, error] = isUserSignedIn
      ? ivalidate<ITodoPostUserSchema>(todoPostUserSchema, req.body)
      : ivalidate<ITodoPostGuestSchema>(todoPostGuestSchema, req.body);

    if (error) {
      return res.code(400).send(error);
    }

    if (isUserSignedIn) {
      const todo = await Todo.query().insert({ ...data, author_id: currentUser.id });
      return res.code(201).send(todo);
    }

    const { email, name, ...todoFields } = data as ITodoPostGuestSchema;
    const user = await User.query().findOne({ name });
    if (user) {
      if (user.role !== roles.guest) {
        return res.code(400).send(makeErrors({ name: 'name already exist' }));
      }

      const todo = await Todo.query().insert({ ...todoFields, author_id: user.id });
      res.code(201).send(todo);
    } else {
      const newUser = await User.query().insert({ name, email, role: roles.guest });
      const todo = await Todo.query().insert({ ...todoFields, author_id: newUser.id });
      res.code(201).send(todo);
    }
  });

  app.put('/todos/:id', { preHandler: [checkAdmin, validate(todoPutSchema)] }, async (req, res) => {
    const { id } = req.params as any;
    const data: ITodoPutSchema = req.vlBody;
    const oldTodo = await Todo.query().findById(id);
    if (!oldTodo) {
      return res.code(400).send({ message: 'Entity does not exist' });
    }
    const newData = oldTodo.text === data.text ? data : { ...data, is_edited_by_admin: true };
    const todo = await Todo.query().updateAndFetchById(id, newData);
    res.code(201).send(todo);
  });

  app.delete('/todos/:id', { preHandler: checkAdmin }, async (req, res) => {
    const { id } = req.params as any;
    await Todo.query().deleteById(id);
    res.code(201).send({});
  });
};
