import { translations } from '../mock/translations';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('translations').del();

  // Inserts seed entries
  await knex('translations').insert(translations);
}
