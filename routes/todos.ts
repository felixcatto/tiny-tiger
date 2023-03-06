import { FastifyInstance } from 'fastify';
import { isNumber } from 'lodash-es';
import { IPaginationSchema, ITodoSchema, ITodoSortSchema } from '../lib/types.js';
import { checkAdmin, paginationSchema, validate } from '../lib/utils.js';
import { todoSchema, todoSortSchema } from '../models/Todo.js';

type IQuerySchema = IPaginationSchema & ITodoSortSchema;

export default async (app: FastifyInstance) => {
  const { User, Todo, knex } = app.objection;
  const querySchema = paginationSchema.concat(todoSortSchema);

  app.get('/todos', { preHandler: validate(querySchema, 'query') }, async (req, res) => {
    const { sortOrder, sortBy, page, size } = req.vlQuery as IQuerySchema;
    let totalRows = 0;
    let todoQuery = Todo.query();

    if (sortOrder && sortBy) {
      todoQuery.orderBy(sortBy, sortOrder);
    } else {
      todoQuery.orderBy('id');
    }

    if (size && isNumber(page)) {
      todoQuery.offset(page * size).limit(size);
      const [data] = await knex.count('*').from('todos');
      totalRows = Number(data.count);
    }

    const todos = await todoQuery.withGraphFetched('author');
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
