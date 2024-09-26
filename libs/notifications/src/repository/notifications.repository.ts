import { InjectKnex } from '@app/knex';
import { Knex } from 'knex';
import { Injectable } from '@nestjs/common';
import { INotificationModel } from '../models/notification.model';

@Injectable()
export class NotificationsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  public async createOne(
    notification: INotificationModel,
    trx?: Knex.Transaction,
  ) {
    const created = await this.getBuilder(trx).insert(notification, 'id');
    return created[0] || null;
  }

  findByParam(param: Partial<INotificationModel>) {
    return this.getBuilder().where(param).returning('*');
  }

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<INotificationModel>>('notifications')
      : this.knex<Required<INotificationModel>>('notifications');
  }
}
