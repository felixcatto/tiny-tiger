import { ITodoClass, IUserClass } from '../lib/types.js';
import { getApiUrl } from '../lib/utils.js';
import getApp from '../main/index.js';
import todosFixture from './fixtures/todos.js';
import usersFixture from './fixtures/users.js';
import { getLoginCookie } from './fixtures/utils.js';

describe('todos', () => {
  const server = getApp();
  let User: IUserClass;
  let Todo: ITodoClass;
  let loginCookie;

  beforeAll(async () => {
    await server.ready();
    User = server.objection.User;
    Todo = server.objection.Todo;
    await Todo.query().delete();
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
    loginCookie = await getLoginCookie(server);
  });

  beforeEach(async () => {
    await Todo.query().delete();
    await Todo.query().insertGraph(todosFixture);
  });

  it('GET /api/todos', async () => {
    const res = await server.inject({ method: 'get', url: getApiUrl('todos') });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject(todosFixture);
  });

  it('POST /api/todos', async () => {
    const todo = { text: 'ggwp', author_id: -1 };
    const res = await server.inject({ method: 'post', url: getApiUrl('todos'), payload: todo });
    const todoFromDb = await Todo.query().findOne({ text: 'ggwp', author_id: -1 });
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toMatchObject(todo);
  });

  it('PUT /api/todos/:id as admin', async () => {
    const todo = { ...todosFixture[0], text: '(edited)' };
    const res = await server.inject({
      method: 'put',
      url: getApiUrl('todo', { id: todo.id }),
      payload: todo,
      cookies: loginCookie,
    });
    const todoFromDb = await Todo.query().findById(todo.id);
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toMatchObject(todo);
  });

  it('PUT /api/todos/:id', async () => {
    const todo = { ...todosFixture[0], text: '(edited)' };
    const res = await server.inject({
      method: 'put',
      url: getApiUrl('todo', { id: todo.id }),
      payload: todo,
    });
    expect(res.statusCode).toBe(403);
  });

  it('DELETE /api/todos/:id as admin', async () => {
    const [todo] = todosFixture;
    const res = await server.inject({
      method: 'delete',
      url: getApiUrl('todo', { id: todo.id }),
      cookies: loginCookie,
    });
    const todoFromDb = await Todo.query().findById(todo.id);
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toBeFalsy();
  });

  afterAll(async () => {
    await server.close();
  });
});
