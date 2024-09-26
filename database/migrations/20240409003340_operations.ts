import type { Knex } from 'knex';

export enum Currency {
  UZS = 'uzs',
  USD = 'usd',
  TG = 'tg',
}

export enum OperationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  NOT_CONFIRM = 'not_confirm',
  REFUSAL = 'refusal',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('operations', (table) => {
    table.increments('id').primary();
    table.integer('lendinger_id').references('users.id').notNullable();
    table.integer('borrowinger_id').references('users.id').notNullable();
    table.integer('actioner_id').references('users.id').nullable();
    table.integer('creator_id').references('users.id').notNullable();
    table.specificType('amount', 'NUMERIC').defaultTo(0).notNullable();
    table.specificType('debt', 'NUMERIC').defaultTo(0).notNullable();
    table
      .enum('currency', [Currency.UZS, Currency.USD, Currency.TG])
      .notNullable();
    table
      .enum('status', [
        OperationStatus.ACTIVE,
        OperationStatus.CLOSED,
        OperationStatus.NOT_CONFIRM,
        OperationStatus.REFUSAL,
      ])
      .defaultTo(OperationStatus.NOT_CONFIRM)
      .notNullable();
    table.boolean('is_blacklist').defaultTo(false).notNullable();
    table.string('description').nullable();
    table.specificType('medias_ids', 'uuid[]').nullable();
    table.timestamp('deadline', { useTz: true }).notNullable();
    table.timestamp('actioned_at', { useTz: true }).nullable();
    table.timestamp('closed_at', { useTz: true }).nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    // Checks
    table.check('?? >= ??', ['amount', 0]);
    table.check('?? >= ??', ['debt', 0]);
    table.check('?? <= ??', ['debt', 'amount']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('operations');
}
