import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('medias', function (table) {
    table.uuid('filename').primary();
    table.string('mimetype').notNullable();
    table.string('original_name').notNullable();
    table.float('size').notNullable();
    table.string('extension').notNullable();
    table.string('path').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('medias');
}
