import { Injectable } from '@nestjs/common';
import { InjectKnex, KnexService } from '@app/knex';
import { Knex } from 'knex';
import { UserNotificationStatus } from 'database/migrations/20240409005321_user_notifications';
import { IUserNotificationModel } from '../models/user-notification.model';
import { UserNotificationQueryDto } from '../dto/query-notification.dto';

@Injectable()
export class UserNotificationRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<IUserNotificationModel>>('user_notifications')
      : this.knex<Required<IUserNotificationModel>>('user_notifications');
  }

  public async createOne(
    userNotification: IUserNotificationModel,
    trx?: Knex.Transaction,
  ) {
    const created = await this.getBuilder(trx).insert(userNotification);
    return created[0] || null;
  }

  public async createMany(
    userNotifications: IUserNotificationModel[],
    trx?: Knex.Transaction,
  ) {
    return this.getBuilder(trx).insert(userNotifications, 'id');
  }

  public async updateOne(
    userNotification: Required<IUserNotificationModel>,
    trx?: Knex.Transaction,
  ) {
    const { id, ...partialEntityData } = userNotification;
    const [updated] = await this.getBuilder(trx)
      .where({ id })
      .update(partialEntityData, 'id');
    return updated;
  }

  async findByParam(param: Partial<IUserNotificationModel>) {
    return this.getBuilder().select('*').where(param).first();
  }
  findOneWebsocket(id: number) {
    return this.knex('notifications')
      .select(
        'notifications.id',
        'notifications.title',
        'notifications.description',
        'users.avatar',
        'notifications.item_type',
        'notifications.item_id',
        'notifications.created_at',
        this.knex.raw(
          "users.first_name || ' ' || users.last_name sender_full_name",
        ),
        this.knex.raw(`
         case when operations.status is null then transactions.status else operations.status end as confirm_status
        `),
      )
      .leftJoin('users', 'notifications.author_id', 'users.id')
      .leftJoin('operations', function () {
        this.on('notifications.item_id', 'operations.id').andOnVal(
          'notifications.item_type',
          'operations',
        );
      })
      .leftJoin('transactions', function () {
        this.on('notifications.item_id', 'transactions.id').andOnVal(
          'notifications.item_type',
          'transactions',
        );
      })
      .where('notifications.id', id)
      .first();
  }

  public async findAllNotificationByUser(
    account_id: number,
    { filter, ...cursorParams }: UserNotificationQueryDto,
  ) {
    const queryBuilder = this.getBuilder()
      .select(
        'user_notifications.id',
        'notifications.title',
        'notifications.description',
        'user_notifications.status',
        'users.avatar',
        'notifications.item_type',
        'notifications.item_id',
        'notifications.created_at',
        this.knex.raw(
          "users.first_name || ' ' || users.last_name sender_full_name",
        ),
        this.knex.raw(`
         case when operations.status is null then transactions.status else operations.status end as confirm_status
        `),
      )
      .innerJoin(
        'notifications',
        'user_notifications.notification_id',
        'notifications.id',
      )
      .leftJoin('users', 'notifications.author_id', 'users.id')
      .leftJoin('operations', function () {
        this.on('notifications.item_id', 'operations.id').andOnVal(
          'notifications.item_type',
          'operations',
        );
      })
      .leftJoin('transactions', function () {
        this.on('notifications.item_id', 'transactions.id').andOnVal(
          'notifications.item_type',
          'transactions',
        );
      })
      .where('user_notifications.reciver_id', account_id);

    return KnexService.paginate({
      query: KnexService.filter(queryBuilder, filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'user_notifications.id',
      },
    });
  }

  async updateAccountNotificaiton(
    account_id: number,
    notification_id: number,
    status: UserNotificationStatus,
  ) {
    const [res] = await this.getBuilder()
      .update({
        status,
      })
      .where({
        reciver_id: account_id,
        notification_id,
      })
      .returning('*');
    return res;
  }
}
