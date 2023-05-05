import { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  const { User } = app.orm;

  app.get('/users', async (req, res) => {
    const users = await User.query();
    res.code(200).send(users);
  });
};
