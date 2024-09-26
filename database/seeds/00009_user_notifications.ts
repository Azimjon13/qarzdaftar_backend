import { notification_accounts } from '../mock/user_notifications';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user_notifications').del();

  // Inserts seed entries
  await knex('user_notifications').insert(notification_accounts);
}
