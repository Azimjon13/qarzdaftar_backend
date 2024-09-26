import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('translation_values', function (table) {
    table
      .integer('translation_id')
      .notNullable()
      .references('translations.id')
      .onDelete('CASCADE');
    table
      .integer('translation_key_id')
      .notNullable()
      .references('translation_keys.id')
      .onDelete('CASCADE');
    table.string('name', 500).notNullable();
    table.primary(['translation_id', 'translation_key_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('translation_values');
}
