import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_contacts', (table) => {
    table.increments('id').primary();
    table.integer('author_id').references('users.id').notNullable();
    table.integer('customer_id').references('users.id').notNullable();
    table.string('full_name').notNullable();
    // Unique
    table.unique(['customer_id', 'author_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_contacts');
}
