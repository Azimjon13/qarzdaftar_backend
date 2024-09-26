import { operations } from '../mock/operations';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('operations').del();

  // Inserts seed entries
  await knex('operations').insert(operations);
}
