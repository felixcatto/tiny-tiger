import { omit } from 'lodash-es';
import { IUserClass } from '../server/lib/types.js';
import { getApiUrl } from '../server/lib/utils.js';
import getApp from '../server/main/index.js';
import usersFixture from './fixtures/users.js';

describe('users', () => {
  const server = getApp();
  let User: IUserClass;

  beforeAll(async () => {
    await server.ready();
    User = server.orm.User;
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
  });

  it('GET /api/users', async () => {
    const res = await server.inject({ method: 'get', url: getApiUrl('users') });
    const expected = usersFixture.map(el => omit(el, 'password'));

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject(expected);
  });

  afterAll(async () => {
    await server.close();
  });
});
