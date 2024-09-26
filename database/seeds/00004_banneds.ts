import { banned_users } from '../mock/banned_users';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('banned_users').del();

  // Inserts seed entries
  await knex('banned_users').insert(banned_users);
}
