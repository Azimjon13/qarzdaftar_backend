import { transactions } from '../mock/transactions';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('transactions').del();

  // Inserts seed entries
  await knex('transactions').insert(transactions);
}
