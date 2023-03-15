const basicTodos = [
  {
    id: -3,
    text: 'guest todo',
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -2,
  },
  {
    id: -2,
    text: 'Todo, todo, ..., todo?',
    is_completed: true,
    is_edited_by_admin: false,
    author_id: -1,
  },
  {
    id: -1,
    text: 'Inverse todo',
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -1,
  },
];

export const extraTodos = [
  {
    id: -10,
    text: 'Closure',
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -1,
  },
  {
    id: -9,
    text: 'Polymer',
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -4,
  },
  {
    id: -8,
    text: 'Elixir',
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -3,
  },

  {
    id: -7,
    text: 'Backbone.js',
    is_completed: true,
    is_edited_by_admin: false,
    author_id: -1,
  },
  {
    id: -6,
    text: 'yet another todo',
    is_completed: true,
    is_edited_by_admin: true,
    author_id: -2,
  },
  {
    id: -5,
    text: "Tailwind CSS ... It’s easy to customize, adapts to any design, and the build size is tiny.",
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -4,
  },
  {
    id: -4,
    text: 'I feel like an idiot for not using Tailwind CSS until now',
    is_completed: false,
    is_edited_by_admin: false,
    author_id: -3,
  },
];

export const fullTodos = [...extraTodos, ...basicTodos];

export default basicTodos;
