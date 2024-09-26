import { user_contacts } from '../mock/user_contacts';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user_contacts').del();

  // Inserts seed entries
  await knex('user_contacts').insert(user_contacts);
}
