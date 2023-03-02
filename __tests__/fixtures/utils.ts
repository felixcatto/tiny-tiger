import cookie from 'cookie';
import { FastifyInstance } from 'fastify';
import { isString } from 'lodash-es';
import { getApiUrl } from '../../lib/utils.js';
import usersFixture from './users.js';
import { sessionName } from '../../lib/utils.js';

const [admin] = usersFixture;
export const getLoginCookie = async (server: FastifyInstance, user = admin) => {
  const res = await server.inject({
    method: 'post',
    url: getApiUrl('session'),
    payload: user,
  });

  const rawCookie = res.headers['set-cookie'];
  if (!isString(rawCookie)) throw new Error('no cookies from server');

  const cookieObj = cookie.parse(rawCookie);
  const sessionValue = cookieObj[sessionName];
  if (!sessionValue) throw new Error('no login cookies from server');

  return { [sessionName]: sessionValue };
};
