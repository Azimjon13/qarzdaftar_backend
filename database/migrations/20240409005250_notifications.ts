import type { Knex } from 'knex';

export enum NotificationType {
  TRANSACTION = 'transactions',
  OPERATION = 'operations',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('author_id').references('users.id').notNullable();
    table.string('title').notNullable();
    table.string('description').nullable();
    table.integer('item_id').notNullable();
    table
      .enum('item_type', [
        NotificationType.OPERATION,
        NotificationType.TRANSACTION,
      ])
      .notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notifications');
}
