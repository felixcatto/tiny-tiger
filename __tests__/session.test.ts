import { omit } from 'lodash-es';
import { IUserClass } from '../lib/types.js';
import { authenticate, composeValue, getApiUrl, guestUser, sessionName } from '../lib/utils.js';
import getApp from '../main/index.js';
import usersFixture from './fixtures/users.js';
import { getLoginCookie } from './fixtures/utils.js';

describe('session', () => {
  const server = getApp();
  let User: IUserClass;
  const { keygrip } = server;
  const fetchUser = async userId => User.query().findById(userId);

  beforeAll(async () => {
    await server.ready();
    User = server.objection.User;
  });

  beforeEach(async () => {
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
  });

  it('authentificates user', async () => {
    const [user] = usersFixture;
    const signature = keygrip.sign(String(user.id));
    const rawCookies = `session=${composeValue(user.id, signature)}`;
    const [receivedUser, shouldRemoveSession] = await authenticate(rawCookies, keygrip, fetchUser);
    expect(receivedUser).toMatchObject(omit(user, 'password'));
    expect(shouldRemoveSession).toBeFalsy();
  });

  it('fails authentificate if signature incorrect', async () => {
    const [user] = usersFixture;
    const signature = keygrip.sign(String(user.id));
    const falseSignature = `x${signature.slice(1)}`;
    const rawCookies = `session=${composeValue(user.id, falseSignature)}`;
    const [receivedUser, shouldRemoveSession] = await authenticate(rawCookies, keygrip, fetchUser);

    expect(receivedUser).toMatchObject(guestUser);
    expect(shouldRemoveSession).toBeTruthy();
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
