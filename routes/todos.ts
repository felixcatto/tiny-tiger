import { FastifyInstance } from 'fastify';
import { isArray, isNumber, isString } from 'lodash-es';
import { IFiltersSchema, IPaginationSchema, ISortSchema, ITodoSchema } from '../lib/types.js';
import { checkAdmin, paginationSchema, validate } from '../lib/utils.js';
import { todoFilterSchema, todoSchema, todoSortSchema } from '../models/Todo.js';

type IQuerySchema = IPaginationSchema & ISortSchema & IFiltersSchema;

export default async (app: FastifyInstance) => {
  const { User, Todo, knex } = app.objection;
  const querySchema = paginationSchema.concat(todoSortSchema).concat(todoFilterSchema);

  app.get('/todos', { preHandler: validate(querySchema, 'query') }, async (req, res) => {
    const { sortOrder, sortBy, page, size, filters } = req.vlQuery as IQuerySchema;

    let totalRows = 0;
    let todoQuery = Todo.query().withGraphJoined('author');

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
      todoQuery.offset(page * size).limit(size);
      totalRows = await Todo.query().resultSize();
    }

    const todos = await todoQuery;

    res.code(200).send({ rows: todos, totalRows });
  });

  app.post('/todos', { preHandler: validate(todoSchema) }, async (req, res) => {
    const data: ITodoSchema = req.vlBody;
    const todo = await Todo.query().insert(data);
    res.code(201).send(todo);
  });

  app.put('/todos/:id', { preHandler: [checkAdmin, validate(todoSchema)] }, async (req, res) => {
    const { id } = req.params as any;
    const data: ITodoSchema = req.vlBody;
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
