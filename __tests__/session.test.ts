import { IUserClass } from '../lib/types.js';
import { getApiUrl, sessionName } from '../lib/utils.js';
import getApp from '../main/index.js';
import usersFixture from './fixtures/users.js';
import { getLoginCookie } from './fixtures/utils.js';

describe('session', () => {
  const server = getApp();
  let User: IUserClass;

  beforeAll(async () => {
    await server.ready();
    User = server.objection.User;
  });

  beforeEach(async () => {
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
  });

  it('POST /api/session', async () => {
    const loginCookie = await getLoginCookie(server);
    expect(loginCookie).toEqual(expect.any(Object));
  });

  it('DELETE /api/session', async () => {
    const res = await server.inject({
      method: 'delete',
      url: getApiUrl('session'),
    });
    const sessionCookie = res.cookies.find(el => el.name === sessionName);
    expect(res.statusCode).toBe(201);
    expect(sessionCookie).toMatchObject({ name: 'session', value: '' });
  });

  afterAll(async () => {
    await server.close();
  });
});
