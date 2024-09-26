import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.smallint('local_blacklist_count').notNullable();
    table.smallint('global_blacklist_count').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('settings');
}
