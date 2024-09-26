import type { Knex } from 'knex';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETE = 'delete',
  PENDING = 'pending',
  BLACKLIST = 'blacklist',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.string('phone', 20).notNullable();
    table.string('avatar').nullable();
    table.enum('gender', [Gender.MALE, Gender.FEMALE]).nullable();
    table
      .enum('role', [Role.SUPER_ADMIN, Role.EMPLOYEE, Role.CUSTOMER])
      .notNullable();
    table
      .enum('status', [
        UserStatus.ACTIVE,
        UserStatus.INACTIVE,
        UserStatus.DELETE,
        UserStatus.PENDING,
        UserStatus.BLACKLIST,
      ])
      .notNullable();
    table.integer('score').defaultTo(0).nullable();
    table.string('telegram_id').nullable();
    table.boolean('is_banned').defaultTo(false);
    table.boolean('is_tg_login').defaultTo(false).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.jsonb('meta').defaultTo({
      notifications: {},
      language: 'en',
      theme: 'light',
    });
    // Checks
    table.check('?? >= ??', ['score', 0]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
