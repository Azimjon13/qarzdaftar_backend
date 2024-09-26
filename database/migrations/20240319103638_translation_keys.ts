import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('translation_keys', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('title', 500).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('translation_keys');
}
