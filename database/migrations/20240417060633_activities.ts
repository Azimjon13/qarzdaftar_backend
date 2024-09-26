import type { Knex } from 'knex';

export enum ActivityType {
  USER = 'users',
  OPERATION = 'operations',
  TRANSACTION = 'transactions',
  BANNED_USER = 'banned_users',
  USER_CONTACT = 'user_contacts',
  NOTIFICATION = 'notifications',
  SETTINGS = 'settings',
}

export enum ActivityActionType {
  CREATE = 'create',
  UPDATE = 'update',
  READ = 'read',
  DELETE = 'delete',
  CONFIRM = 'confirm',
  REFUSAL = 'refusal',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('activities', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('users.id').notNullable();
    table.integer('item_id').nullable();
    table.string('description').notNullable();
    table
      .enum('item_type', [
        ActivityType.USER,
        ActivityType.OPERATION,
        ActivityType.TRANSACTION,
        ActivityType.BANNED_USER,
        ActivityType.USER_CONTACT,
        ActivityType.NOTIFICATION,
        ActivityType.SETTINGS,
      ])
      .notNullable();
    table.enum('action_type', [
      ActivityActionType.CREATE,
      ActivityActionType.UPDATE,
      ActivityActionType.READ,
      ActivityActionType.DELETE,
      ActivityActionType.CONFIRM,
      ActivityActionType.REFUSAL,
    ]);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('activities');
}
