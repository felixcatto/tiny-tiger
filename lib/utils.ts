import cookie from 'cookie';
import crypto from 'crypto';
import fp from 'fastify-plugin';
import knexConnect from 'knex';
import { capitalize, isString } from 'lodash-es';
import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import * as y from 'yup';
import knexConfig from '../knexfile.js';
import { guestUser, isAdmin, isSignedIn } from './sharedUtils.js';
import { IValidateFn } from './types.js';

export * from './sharedUtils.js';

export const dirname = url => fileURLToPath(path.dirname(url));

const getYupErrors = e => {
  if (e.inner) {
    return e.inner.reduce(
      (acc, el) => ({
        ...acc,
        [el.path]: el.message,
      }),
      {}
    );
  }

  return e.message; // TODO: no object?
};

export const makeErrors = errors => ({ errors });

export const validate: IValidateFn =
  (schema, payloadType = 'body') =>
  async (req, res) => {
    const payload = payloadType === 'query' ? req.query : req.body;

    try {
      const validatedBody = schema.validateSync(payload, {
        abortEarly: false,
        stripUnknown: true,
      });
      req[`vl${capitalize(payloadType)}`] = validatedBody;
    } catch (e) {
      res.code(400).send({ message: 'Input is not valid', errors: getYupErrors(e) });
    }
  };

export const sessionName = 'session';
const composeValue = (value, signature) => `${value}.${signature}`;
const decomposeValue = compositValue => {
  const values = compositValue.split('.');
  if (values.length !== 2) return [];
  return values;
};

export const setSessionCookie = (res, keygrip, userId) => {
  const cookieValue = String(userId);
  const signature = keygrip.sign(cookieValue);
  res.header(
    'Set-Cookie',
    cookie.serialize(sessionName, composeValue(cookieValue, signature), {
      path: '/',
      httpOnly: true,
    })
  );
};

export const removeSessionCookie = res => {
  res.header(
    'Set-Cookie',
    cookie.serialize(sessionName, '', { path: '/', httpOnly: true, maxAge: 0 })
  );
};

export const checkValueUnique = async (Enitity, column, value, excludeId: string | null = null) => {
  const existingEntities = await Enitity.query().select(column).whereNot('id', excludeId);
  if (existingEntities.some(entity => entity[column] === value)) {
    return {
      isUnique: false,
      errors: { [column]: `${column} should be unique` },
    };
  }

  return { isUnique: true, errors: null };
};

export const checkAdmin = async (req, res) => {
  if (!isAdmin(req.currentUser)) {
    res.code(403).send({ message: 'Forbidden' });
  }
};

export const checkSignedIn = async (req, res) => {
  if (!isSignedIn(req.currentUser)) {
    res.code(401).send({ message: 'Unauthorized' });
  }
};

export const encrypt = value => {
  const [key] = process.env.KEYS!.split(',');
  return crypto.createHmac('sha256', key).update(value).digest('hex');
};

export const objectionPlugin = fp(async (app, { models }) => {
  const knex = knexConnect(knexConfig[app.mode]);
  Model.knex(knex);
  app.objection = { ...models, knex };

  app.addHook('onClose', async (_, done) => {
    await knex.destroy();
    done();
  });
});

export const currentUserPlugin = fp(async app => {
  const { keygrip } = app;
  const { User } = app.objection;

  app.addHook('onRequest', async (req, res) => {
    const rawCookies = req.headers.cookie;
    if (!isString(rawCookies)) {
      req.currentUser = guestUser;
    } else {
      const cookies = cookie.parse(rawCookies);
      const sessionValue = cookies[sessionName];
      if (!sessionValue) {
        req.currentUser = guestUser;
      } else {
        const [userId, signature] = decomposeValue(sessionValue);
        if (!userId || !signature) {
          removeSessionCookie(res);
          req.currentUser = guestUser;
        } else {
          const isSignatureCorrect = keygrip.verify(userId, signature);
          const user = await User.query().findById(userId);
          if (user) {
            req.currentUser = user;
          } else {
            removeSessionCookie(res);
            req.currentUser = guestUser;
          }
        }
      }
    }
  });
});

export const paginationSchema = y.object({
  size: y.number(),
  page: y.number(),
});
