import type { Knex } from 'knex';

export enum UserNotificationStatus {
  NEW = 'new',
  READ = 'read',
  CLEAR = 'clear',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_notifications', (table) => {
    table.increments('id').primary();
    table
      .integer('notification_id')
      .references('notifications.id')
      .notNullable();
    table.integer('reciver_id').references('users.id').notNullable();
    table
      .enum('status', [
        UserNotificationStatus.NEW,
        UserNotificationStatus.READ,
        UserNotificationStatus.CLEAR,
      ])
      .defaultTo(UserNotificationStatus.NEW);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_notifications');
}
