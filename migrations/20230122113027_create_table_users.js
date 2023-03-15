export const up = async knex => {
  await knex.schema.createTable('users', table => {
    table.increments().primary();
    table.string('name').notNullable();
    table.string('role').notNullable();
    table.string('email').unique().notNullable();
    table.string('password_digest');
    table.boolean('is_signed_in').defaultTo(false);
  });
};

export const down = async knex => {
  await knex.schema.dropTable('users');
};
