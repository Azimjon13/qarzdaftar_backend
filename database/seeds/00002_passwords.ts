import { passwords } from '../mock/passwords';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('passwords').del();

  // Inserts seed entries
  await knex('passwords').insert(passwords);
}
