import { FastifyInstance } from 'fastify';
import { ITodoSchema } from '../lib/types.js';
import { checkAdmin, validate } from '../lib/utils.js';
import { todoSchema } from '../models/Todo.js';

export default async (app: FastifyInstance) => {
  const { User, Todo } = app.objection;

  app.get('/todos', async (req, res) => {
    const todos = await Todo.query().withGraphFetched('author');
    res.code(200).send(todos);
  });

  app.post('/todos', { preHandler: validate(todoSchema) }, async (req, res) => {
    const data: ITodoSchema = req.vlBody;
    const todo = await Todo.query().insert(data);
    res.code(201).send(todo);
  });

  app.put('/todos/:id', { preHandler: [checkAdmin, validate(todoSchema)] }, async (req, res) => {
    const { id } = req.params as any;
    const data: ITodoSchema = req.vlBody;
    const todo = await Todo.query().updateAndFetchById(id, data);
    res.code(201).send(todo);
  });

  app.delete('/todos/:id', { preHandler: checkAdmin }, async (req, res) => {
    const { id } = req.params as any;
    await Todo.query().deleteById(id);
    res.code(201).send({});
  });
};
