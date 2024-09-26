import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('banned_users', (table) => {
    table.increments('id').primary();
    table.integer('author_id').references('users.id').notNullable();
    table.integer('banned_id').references('users.id').notNullable();
    table.integer('score').notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    // Checks
    table.check('?? >= ??', ['score', 0]);
    // Unique
    table.unique(['author_id', 'banned_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('banned_users');
}
