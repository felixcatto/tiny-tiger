import { omit, orderBy } from 'lodash-es';
import { ITodo } from '../server/lib/types.js';
import { getApiUrl, leftJoin } from '../server/lib/utils.js';
import getApp from '../server/main/index.js';
import todosFixture, { extraTodos, fullTodos } from './fixtures/todos.js';
import usersFixture from './fixtures/users.js';
import { getLoginCookie } from './fixtures/utils.js';

describe('todos', () => {
  const server = getApp();
  let loginCookie;

  beforeAll(async () => {
    await server.ready();
    const { User, Todo } = server.orm;
    await Todo.query().delete();
    await User.query().delete();
    await User.query().insertGraph(usersFixture as any);
    loginCookie = await getLoginCookie(server);
  });

  beforeEach(async () => {
    const { Todo } = server.orm;
    await Todo.query().delete();
    await Todo.query().insertGraph(todosFixture);
  });

  it('GET /api/todos', async () => {
    const res = await server.inject({ method: 'get', url: getApiUrl('todos') });
    const { rows } = res.json();
    expect(res.statusCode).toBe(200);
    expect(rows).toMatchObject(todosFixture);
  });

  it('GET /api/todos - filter', async () => {
    const { Todo } = server.orm;
    const [vasa] = usersFixture;
    const filters = [
      { filterBy: 'author.name', filter: vasa.name },
      { filterBy: 'is_completed', filter: [true] },
    ];

    await Todo.query().insertGraph(extraTodos);
    const res = await server.inject({
      method: 'get',
      url: getApiUrl('todos', {}, { filters: JSON.stringify(filters) }),
    });

    const received = res.json().rows;

    const authorNameFilter = filters[0].filter;
    const isCompletedFilter = filters[1].filter as any[];
    const users = usersFixture.map(user => omit(user, 'password'));
    const todosWithAuthor: ITodo[] = leftJoin(fullTodos, users, 'author_id', 'id', 'author');

    const expected = todosWithAuthor.filter(
      todo =>
        todo.author?.name === authorNameFilter && isCompletedFilter.includes(todo.is_completed)
    );

    expect(res.statusCode).toBe(200);
    expect(received).toMatchObject(expected);
  });

  it('GET /api/todos - sort', async () => {
    const { Todo } = server.orm;
    await Todo.query().insertGraph(extraTodos);
    const sortOrder = 'desc';
    const sortBy = 'is_completed';
    const res = await server.inject({
      method: 'get',
      url: getApiUrl('todos', {}, { sortOrder, sortBy }),
    });

    const received = res.json().rows.map(el => el[sortBy]);
    const expected = orderBy(fullTodos, sortBy, sortOrder).map(el => el[sortBy]);
    expect(res.statusCode).toBe(200);
    expect(received).toMatchObject(expected);
  });

  it('GET /api/todos - sort complex field', async () => {
    const { Todo } = server.orm;
    await Todo.query().insertGraph(extraTodos);
    const res = await server.inject({
      method: 'get',
      url: getApiUrl('todos', {}, { sortOrder: 'desc', sortBy: 'author.name' }),
    });

    const received = res.json().rows.map(el => el.author.name);
    const todosWithAuthor = leftJoin(fullTodos, usersFixture, 'author_id', 'id', 'author');
    const expected = orderBy(todosWithAuthor, 'author.name', 'desc').map(el => el.author.name);

    expect(res.statusCode).toBe(200);
    expect(received).toMatchObject(expected);
  });

  it('GET /api/todos - pagination', async () => {
    const { Todo } = server.orm;
    await Todo.query().insertGraph(extraTodos);
    const page = 1;
    const size = 3;
    const res = await server.inject({
      method: 'get',
      url: getApiUrl('todos', {}, { size, page, sortBy: 'id', sortOrder: 'asc' }),
    });

    const received = res.json();
    const { rows, totalRows } = received;
    const expected = fullTodos.slice(page * size, page * size + size);
    expect(res.statusCode).toBe(200);
    expect(rows).toMatchObject(expected);
    expect(totalRows).toEqual(fullTodos.length);
  });

  it('GET /api/todos - filter & sort & pagination', async () => {
    const { Todo } = server.orm;
    const filters = [
      { filterBy: 'text', filter: 's' },
      { filterBy: 'is_completed', filter: [false] },
    ];
    const sortOrder = 'desc';
    const sortBy = 'author.name';
    const page = 1;
    const size = 2;

    await Todo.query().insertGraph(extraTodos);
    const res = await server.inject({
      method: 'get',
      url: getApiUrl(
        'todos',
        {},
        { filters: JSON.stringify(filters), sortBy, sortOrder, page, size }
      ),
    });

    const received = res.json().rows;

    const stringFilter = filters[0].filter as any;
    const arrayFilter = filters[1].filter as any[];
    const users = usersFixture.map(user => omit(user, 'password'));
    const todosWithAuthor: ITodo[] = leftJoin(fullTodos, users, 'author_id', 'id', 'author');

    const filtered = todosWithAuthor.filter(
      todo => todo.text.includes(stringFilter) && arrayFilter.includes(todo.is_completed)
    );
    const sorted = orderBy(filtered, sortBy, sortOrder);
    const expected = sorted.slice(page * size, page * size + size);

    expect(res.statusCode).toBe(200);
    expect(received).toMatchObject(expected);
  });

  it('POST /api/todos', async () => {
    const { Todo } = server.orm;
    const todo = { text: 'ggwp' };
    const res = await server.inject({
      method: 'post',
      url: getApiUrl('todos'),
      payload: todo,
      cookies: loginCookie,
    });
    const todoFromDb = await Todo.query().findOne({ text: todo.text });
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toMatchObject(todo);
  });

  it('POST /api/todos creates user if not authentificated', async () => {
    const { Todo, User } = server.orm;
    const todo = { text: 'ggwp', name: 'guest', email: 'guest@guest.com' };
    const res = await server.inject({ method: 'post', url: getApiUrl('todos'), payload: todo });

    const expectedTodo = { text: 'ggwp' };
    const expectedUser = { name: todo.name, email: todo.email };
    const todoFromDb = await Todo.query().findOne(expectedTodo);
    const userFromDb = await User.query().findOne(expectedUser);
    expect(res.statusCode).toBe(201);
    expect(todoFromDb).toMatchObject(expectedTodo);
    expect(userFromDb).toMatchObject(expectedUser);
  });

  it('PUT /api/todos/:id - as admin, edit any field except `text`', async () => {
    const { Todo } = server.orm;
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
    const { Todo } = server.orm;
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
    const { Todo } = server.orm;
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
