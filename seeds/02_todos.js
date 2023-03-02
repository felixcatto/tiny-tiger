import todos from '../__tests__/fixtures/todos.js';

export const seed = async knex => {
  await knex('todos').delete();
  await knex('todos').insert(todos);
};
