import type { Knex } from 'knex';

export enum TransactionType {
  PARTIAL_PAY = 'partial-pay',
  PAY_ALL = 'pay-all',
}

export enum TransactionStatus {
  NOT_CONFIRM = 'not_confirm',
  CONFIRM = 'confirm',
  REFUSAL = 'refusal',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('author_id').references('users.id').notNullable();
    table.integer('operation_id').references('operations.id').notNullable();
    table
      .enum('type', [TransactionType.PARTIAL_PAY, TransactionType.PAY_ALL])
      .notNullable();
    table
      .enum('status', [
        TransactionStatus.NOT_CONFIRM,
        TransactionStatus.CONFIRM,
        TransactionStatus.REFUSAL,
      ])
      .defaultTo(TransactionStatus.NOT_CONFIRM)
      .notNullable();
    table.specificType('amount', 'NUMERIC').defaultTo(0).notNullable();
    table.string('note').nullable();
    table.timestamp('changed_status_at', { useTz: true }).nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    // Checks
    table.check('?? >= ??', ['amount', 0]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
