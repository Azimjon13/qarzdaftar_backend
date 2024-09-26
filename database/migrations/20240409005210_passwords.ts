import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('passwords', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('users.id').notNullable();
    table.text('hash').notNullable();
    table.boolean('is_active').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('passwords');
}
