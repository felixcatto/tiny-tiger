import { FastifyInstance } from 'fastify';
import { IUserGetSchema } from '../lib/types.js';
import { validate } from '../lib/utils.js';
import { userGetSchema } from '../models/User.js';

export default async (app: FastifyInstance) => {
  const { User } = app.orm;

  app.get('/users', { preHandler: validate(userGetSchema, 'query') }, async (req, res) => {
    const { withTodos } = req.vlQuery as IUserGetSchema;
    const usersQuery = User.query();
    if (withTodos) {
      usersQuery.withGraphFetched('todos');
    }

    const users = await usersQuery;
    res.code(200).send(users);
  });

  app.get('/users/:id', async (req, res) => {
    const { id } = req.params as any;
    const user = await User.query().findById(id);
    res.code(200).send(user);
  });
};
