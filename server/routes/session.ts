import { FastifyInstance } from 'fastify';
import { IUserLoginSchema } from '../lib/types.js';
import {
  encrypt,
  guestUser,
  makeErrors,
  removeSessionCookie,
  setSessionCookie,
  validate,
} from '../lib/utils.js';

export default async (app: FastifyInstance) => {
  const { User, userLoginSchema } = app.orm;

  app.post('/session', { preHandler: validate(userLoginSchema) }, async (req, res) => {
    const data: IUserLoginSchema = req.vlBody;
    const user = await User.query().findOne({ name: data.name });

    if (!user) {
      return res.code(400).send(makeErrors({ name: 'User with such name not found' }));
    }

    if (user.password_digest !== encrypt(data.password)) {
      return res.code(400).send(makeErrors({ password: 'Wrong password' }));
    }

    setSessionCookie(res, app.keygrip, user.id);
    res.code(201).send(user);
  });

  app.delete('/session', async (req, res) => {
    removeSessionCookie(res);
    res.code(201).send(guestUser);
  });
};
