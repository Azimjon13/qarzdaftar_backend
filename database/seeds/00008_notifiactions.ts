import { notifications } from '../mock/notifications';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('notifications').del();

  // Inserts seed entries
  await knex('notifications').insert(notifications);
}
