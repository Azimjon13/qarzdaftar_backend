import type { Knex } from 'knex';

export enum VerificationStatus {
  VERIFIED = 'verified',
  CANCELED = 'canceled',
  PENDING = 'pending',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('verifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('users.id').notNullable();
    table
      .enum('status', [
        VerificationStatus.VERIFIED,
        VerificationStatus.PENDING,
        VerificationStatus.CANCELED,
      ])
      .defaultTo(VerificationStatus.PENDING);
    table.integer('code').notNullable();
    table.timestamp('expired_at', { useTz: true }).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('verifications');
}
