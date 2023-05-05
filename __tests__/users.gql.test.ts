import { omit } from 'lodash-es';
import { getUsers } from '../client/lib/graphql.js';
import { gqlApi, makeGqlPayload } from '../lib/utils.js';
import getApp from '../main/index.js';
import usersFixture from './fixtures/users.js';

describe('users', () => {
  const server = getApp();

  beforeAll(async () => {
    await server.ready();
    const { User } = server.orm;
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
  });

  it('GET /api/users', async () => {
    const res = await server.inject({ ...gqlApi, payload: makeGqlPayload(getUsers) });
    const expected = usersFixture.map(el => omit(el, 'password'));
    const received = res.json().data.getUsers;

    expect(res.json().errors).toBeFalsy();
    expect(received).toMatchObject(expected);
  });

  afterAll(async () => {
    await server.close();
  });
});
