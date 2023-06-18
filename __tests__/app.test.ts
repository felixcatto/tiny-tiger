import getApp from '../server/main/index.js';

describe('requests', () => {
  const server = getApp();

  beforeAll(async () => {
    await server.ready();
  });

  it('GET 200', async () => {
    const res = await server.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    await server.close();
  });
});
