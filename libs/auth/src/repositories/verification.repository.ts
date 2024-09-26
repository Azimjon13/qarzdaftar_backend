import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { InjectKnex } from '@app/knex';
import { VerificationStatus } from 'database/migrations/20240409005232_verifications';
import { UserStatus } from 'database/migrations/20240409001219_users';

export class VerificationsRepository {
  constructor(
    @InjectKnex() private knex: Knex,
    private readonly configService: ConfigService,
  ) {}

  async findLastOneDayVerificationsByAccountId(account_id: number) {
    return this.knex('verifications')
      .select('*')
      .where(
        this.knex.raw(
          `created_at between now() - interval '${
            this.configService.get('SMS_DURATION_DAY') || 1
          } day' and now()`,
        ),
      )
      .andWhere('user_id', account_id);
  }

  async updateAndInsertVerificationWithTr(data: {
    user_id: number;
    code: number;
    expired_at: Date;
    status: VerificationStatus;
  }) {
    return this.knex.transaction(async (trx) => {
      return Promise.all([
        trx('verifications')
          .update({ status: VerificationStatus.CANCELED })
          .where('status', VerificationStatus.PENDING)
          .andWhere('user_id', data.user_id),
        trx('verifications').insert(data).returning('*'),
      ])
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }

  findAll() {
    return this.knex('verifications')
      .select(
        'verifications.id',
        'users.phone',
        'verifications.code',
        'verifications.status',
        'verifications.expired_at',
        'verifications.created_at',
      )
      .where(
        this.knex.raw(
          `verifications.created_at between now() - interval '${1} hours' and now()`,
        ),
      )
      .innerJoin('users', { 'users.id': 'verifications.user_id' })
      .where('verifications.status', 'pending');
  }

  findOneByIdAndStatus(id: number, status: VerificationStatus) {
    return this.knex('verifications')
      .select(
        'verifications.code',
        'verifications.user_id',
        'verifications.expired_at',
        'users.phone',
      )
      .innerJoin('users', { 'users.id': 'verifications.user_id' })
      .where('verifications.id', id)
      .andWhere('verifications.status', status)
      .first();
  }

  async updateById(
    data: { status: VerificationStatus },
    id: number,
    trx?: Knex.Transaction,
  ) {
    return this.getBuilder(trx).update(data).where({ id });
  }

  async updateStatusWithAccountTr(id: number) {
    return this.knex.transaction(async (trx) => {
      return trx('verifications')
        .update('status', VerificationStatus.VERIFIED)
        .where({ id })
        .returning('user_id')
        .then(async ([res]) => {
          const [user] = await trx('users')
            .where({ id: res.user_id })
            .returning('*');
          if (user && user.status === UserStatus.PENDING) {
            await trx('users')
              .where({ id: res.user_id })
              .update({ status: UserStatus.ACTIVE });
          }
          return { user, verification: res };
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }

  private getBuilder(trx?: Knex.Transaction) {
    return trx ? trx('verifications') : this.knex('verifications');
  }
}
