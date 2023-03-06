import { orderBy } from 'lodash-es';
import { ITodoClass, IUserClass } from '../lib/types.js';
import { getApiUrl } from '../lib/utils.js';
import getApp from '../main/index.js';
import todosFixture, { extraTodos, fullTodos } from './fixtures/todos.js';
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
    const { rows } = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(rows).toMatchObject(todosFixture);
  });

  it('GET /api/todos - sort', async () => {
    await Todo.query().insertGraph(extraTodos);
    const res = await server.inject({
      method: 'get',
      url: getApiUrl('todos', {}, { sortOrder: 'desc', sortBy: 'author_id' }),
    });

    const received = JSON.parse(res.body).rows.map(el => el.author_id);
    const expected = orderBy(fullTodos, 'author_id', 'desc').map(el => el.author_id);
    expect(res.statusCode).toBe(200);
    expect(received).toMatchObject(expected);
  });

  it('GET /api/todos - pagination', async () => {
    await Todo.query().insertGraph(extraTodos);
    const page = 1;
    const size = 3;
    const res = await server.inject({
      method: 'get',
      url: getApiUrl('todos', {}, { size, page, sortBy: 'id', sortOrder: 'asc' }),
    });

    const received = JSON.parse(res.body);
    const { rows, totalRows } = received;
    const expected = fullTodos.slice(page * size, page * size + size);
    expect(res.statusCode).toBe(200);
    expect(rows).toMatchObject(expected);
    expect(totalRows).toEqual(fullTodos.length);
  });

  it('POST /api/todos', async () => {
    const todo = { text: 'ggwp', author_id: -1 };
    const res = await server.inject({ method: 'post', url: getApiUrl('todos'), payload: todo });
    const todoFromDb = await Todo.query().findOne({ text: 'ggwp', author_id: -1 });
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toMatchObject(todo);
  });

  it('PUT /api/todos/:id - as admin, edit any field except `text`', async () => {
    const todo = { ...todosFixture[0], is_completed: true };
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

  it('PUT /api/todos/:id - as admin, edit `text` field', async () => {
    const todo = { ...todosFixture[0], text: '(edited)' };
    const res = await server.inject({
      method: 'put',
      url: getApiUrl('todo', { id: todo.id }),
      payload: todo,
      cookies: loginCookie,
    });
    const todoFromDb = await Todo.query().findById(todo.id);
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toMatchObject({ ...todo, is_edited_by_admin: true });
  });

  it('PUT /api/todos/:id - fail as guest', async () => {
    const todo = { ...todosFixture[0], text: '(edited)' };
    const res = await server.inject({
      method: 'put',
      url: getApiUrl('todo', { id: todo.id }),
      payload: todo,
    });
    expect(res.statusCode).toBe(403);
  });

  it('DELETE /api/todos/:id - as admin', async () => {
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
