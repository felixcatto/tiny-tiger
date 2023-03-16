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
import { IAuthenticate, IValidate, IValidateMW } from './types.js';

export * from './sharedUtils.js';

export const dirname = url => fileURLToPath(path.dirname(url));

export const yupFromJson = value => (isString(value) ? JSON.parse(value) : value);

export const getYupErrors = e => {
  if (e.inner) {
    return e.inner.reduce(
      (acc, el) => ({
        ...acc,
        [el.path]: el.message,
      }),
      {}
    );
  }

  return e.message;
};

export const makeErrors = errors => ({ errors });

export const ivalidate: IValidate = (schema, payload) => {
  try {
    const validatedPayload = schema.validateSync(payload, {
      abortEarly: false,
      stripUnknown: true,
    });
    return [validatedPayload, null];
  } catch (e) {
    return [null, { message: 'Input is not valid', errors: getYupErrors(e) }];
  }
};

export const validate: IValidateMW =
  (schema, payloadType = 'body') =>
  async (req, res) => {
    const payload = payloadType === 'query' ? req.query : req.body;

    const [data, error] = ivalidate(schema, payload);
    if (error) {
      res.code(400).send(error);
    } else {
      req[`vl${capitalize(payloadType)}`] = data;
    }
  };

export const sessionName = 'session';
export const composeValue = (value, signature) => `${value}.${signature}`;
export const decomposeValue = compositValue => {
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

export const authenticate: IAuthenticate = async (rawCookies, keygrip, fetchUser) => {
  if (!isString(rawCookies)) return [guestUser, false];

  const cookies = cookie.parse(rawCookies);
  const sessionValue = cookies[sessionName];
  if (!sessionValue) return [guestUser, false];

  const [userId, signature] = decomposeValue(sessionValue);
  if (!userId || !signature) return [guestUser, true];

  const isSignatureCorrect = keygrip.verify(userId, signature);
  if (!isSignatureCorrect) return [guestUser, true];

  const user = await fetchUser(userId);
  if (!user) return [guestUser, true];

  return [user, false];
};

export const currentUserPlugin = fp(async app => {
  const { keygrip } = app;
  const { User } = app.objection;
  const fetchUser = async userId => User.query().findById(userId);

  app.addHook('onRequest', async (req, res) => {
    const rawCookies = req.headers.cookie;
    const [currentUser, shouldRemoveSession] = await authenticate(rawCookies, keygrip, fetchUser);

    if (shouldRemoveSession) removeSessionCookie(res);

    req.currentUser = currentUser;
  });
});

export const leftJoin = (mainEntities, joinedEntities, mainKey, joinedKey, joinProp) =>
  mainEntities.map(mainEntity => {
    const result = joinedEntities.find(
      joinedEntity => mainEntity[mainKey] === joinedEntity[joinedKey]
    );
    return { ...mainEntity, [joinProp]: result };
  });

export const paginationSchema = y.object({
  size: y.number().min(1),
  page: y.number().min(0),
});
