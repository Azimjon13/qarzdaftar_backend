import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('translations', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('flag').nullable();
    table.string('code').notNullable();
    table.boolean('is_default').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('translations');
}
