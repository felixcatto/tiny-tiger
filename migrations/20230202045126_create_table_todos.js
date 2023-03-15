export const up = async knex => {
  await knex.schema.createTable('todos', table => {
    table.increments().primary();
    table.string('text').notNullable();
    table.boolean('is_completed').defaultTo(false);
    table.boolean('is_edited_by_admin').defaultTo(false);
    table.integer('author_id').references('users.id').onDelete('cascade').notNullable();
  });
};

export const down = async knex => {
  await knex.schema.dropTable('todos');
};
