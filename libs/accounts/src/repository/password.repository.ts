import { Knex } from 'knex';
import { InjectKnex } from '@app/knex';

export class PasswordsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  findByAccountId(user_id: number) {
    return this.getBuilder()
      .select('hash')
      .where('user_id', user_id)
      .andWhere('is_active', true)
      .first();
  }

  insertAndUpdate(
    user_id: number,
    newPassword: string,
    trx?: Knex.Transaction,
  ) {
    return this.getBuilder(trx)
      .update('is_active', false)
      .where('is_active', true)
      .andWhere({ user_id })
      .then(() => {
        return this.getBuilder(trx)
          .insert({
            user_id,
            hash: newPassword,
            is_active: true,
          })
          .returning('*');
      });
  }

  private getBuilder(trx?: Knex.Transaction) {
    return trx ? trx('passwords') : this.knex('passwords');
  }
}
