import middie from '@fastify/middie';
import * as Sentry from '@sentry/node';
import cookie from 'cookie';
import crypto from 'crypto';
import fp from 'fastify-plugin';
import knexConnect from 'knex';
import * as color from 'kolorist';
import { capitalize, isNil, isObject, isString } from 'lodash-es';
import mercurius from 'mercurius';
import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import * as y from 'yup';
import knexConfig from '../../knexfile.js';
import { guestUser, isAdmin, isSignedIn, isTest } from './sharedUtils.js';
import { IAuthenticate, IGqlCtx, IValidate, IValidateMW } from './types.js';

export { loadEnv } from '../../scripts/devUtils.js';
export * from './sharedUtils.js';

export const dirname = url => fileURLToPath(path.dirname(url));

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

export const makeGqlError = error => {
  const isCommonError = isString(error);
  if (isCommonError) return new mercurius.ErrorWithProps(error);

  const isYupError = isObject(error.errors) && isString(error.message);
  if (isYupError) return new mercurius.ErrorWithProps(error.message, error);

  const shouldTransformToYupError = isObject(error);
  if (shouldTransformToYupError) {
    const errorMsg = 'Something going wrong';
    return new mercurius.ErrorWithProps(errorMsg, { message: errorMsg, errors: error });
  }
};

export const ivalidate: IValidate = (schema, payload, yupOpts = {}) => {
  const { stripUnknown = true } = yupOpts;
  try {
    const validatedPayload = schema.validateSync(payload, {
      abortEarly: false,
      stripUnknown,
    });
    return [validatedPayload, null];
  } catch (e) {
    return [null, { message: 'Input is not valid', errors: getYupErrors(e) }];
  }
};

export const validate: IValidateMW =
  (schema, payloadType = 'body', yupOpts = {}) =>
  async (req, res) => {
    const payload = payloadType === 'query' ? req.query : req.body;

    const [data, error] = ivalidate(schema, payload, yupOpts);
    if (error) {
      res.code(400).send(error);
    } else {
      req[`vl${capitalize(payloadType)}`] = data;
    }
  };

export const validateGql = schema => async (_, args, ctx: IGqlCtx) => {
  const req = ctx.reply.request;
  const payload = args;

  const [data, error] = ivalidate(schema, payload);
  if (error) {
    throw makeGqlError(error);
  } else {
    req[`vlBody`] = data;
    return CallNext;
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

export const CallNext = '_CallNextMiddleware_';

export const gqlMiddleware = middlewares => async (_, args, ctx: IGqlCtx) => {
  const iter = async fnIndex => {
    if (fnIndex === middlewares.length) return;

    const result = await middlewares[fnIndex](_, args, ctx);
    if (isNil(result)) return;
    if (result === CallNext) return iter(fnIndex + 1);

    return result;
  };

  return iter(0);
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

export const checkAdminGql = async (_, __, ctx: IGqlCtx) => {
  const { request: req } = ctx.reply;
  if (!isAdmin(req.currentUser)) {
    throw makeGqlError('403 Forbidden');
  }

  return CallNext;
};

export const checkSignedIn = async (req, res) => {
  if (!isSignedIn(req.currentUser)) {
    res.code(401).send({ message: 'Unauthorized' });
  }
};

export const encrypt = value => crypto.createHash('sha256').update(value).digest('hex');

export const objectionPlugin = fp(async (app, { models }) => {
  const knex = knexConnect(knexConfig[app.mode]);
  Model.knex(knex);
  app.orm = { ...models, knex };

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
  const { User } = app.orm;
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

export const routeDataSchema = y.object({
  url: y.string().required(),
});

export const supressConsoleLog = fn => {
  const consoleLog = console.log;
  console.log = () => {};
  const result = fn();
  console.log = consoleLog;
  return result;
};

export const loggerPlugin = fp(async app => {
  const supportsArt = color.options.supportLevel === 2;
  const icons = { req: supportsArt ? '←' : '<', res: supportsArt ? '→' : '>' };
  const logResponseTime = true;

  app.addHook('onRequest', async request => {
    const proxyIp = request.headers['x-forwarded-for'];
    const ip = isString(proxyIp) ? proxyIp : request.ip;

    request.log.info(
      `${color.bold(color.blue(icons.req))}${color.blue(request.method)}:${color.green(
        request.url
      )} ${color.white('from ip')} ${color.blue(ip)}`
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    const secFetchDest = request.headers['sec-fetch-dest'];
    const resourceType = isString(secFetchDest) ? secFetchDest : 'other';
    const isUserScript = ['script', 'font', 'image'].includes(resourceType);
    const isNodeScript = request.url.startsWith('/node_modules/');
    if (isUserScript || isNodeScript) return;

    request.log.info(
      `${color.bold(color.magenta(icons.res))}${color.magenta(request.method)}:${color.green(
        request.url
      )} ${color.white('status')} ${color.magenta(reply.statusCode)}${
        logResponseTime
          ? `${color.white(', took')} ${color.magenta(
              Math.round(reply.getResponseTime())
            )}${color.magenta('ms')}`
          : ''
      }`
    );
  });
});

export const vitePlugin = fp(async app => {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  await app.register(middie, { hook: 'onRequest' });
  app.use(vite.middlewares);
  app.vite = vite;
});

export const sentryPlugin = fp(async app => {
  app.addHook('onError', async (req, res, error) => {
    Sentry.withScope(scope => {
      scope.setSDKProcessingMetadata({ request: req.raw });
      Sentry.captureException(error);
    });
  });
});

export const loggerOptions = mode => ({
  disableRequestLogging: true,
  logger: {
    level: isTest(mode) ? 'silent' : 'debug',
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:HH:MM:ss', ignore: 'reqId,pid,hostname' },
    },
  },
});
