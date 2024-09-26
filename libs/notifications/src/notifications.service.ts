import { Injectable, NotFoundException } from '@nestjs/common';
import { UserNotificationRepository } from './repository/user-notification.repository';
import { UserNotificationStatus } from 'database/migrations/20240409005321_user_notifications';
import { INotificationModel } from './models/notification.model';
import { Knex } from 'knex';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationsRepository } from './repository/notifications.repository';
import { UserNotificationEntity } from './entities/user-notification.entity';
import { HTTPMessages } from '@app/shared/constants/http-messages';
import { UserNotificationQueryDto } from './dto/query-notification.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    @InjectQueue('notification') private readonly queue: Queue,
  ) {}

  findAll(userId: number, dto: UserNotificationQueryDto) {
    return this.userNotificationRepository.findAllNotificationByUser(
      userId,
      dto,
    );
  }

  public async sendNotification(
    data: Omit<INotificationModel, 'id' | 'created_at'> & {
      reciver_ids: number[];
    },
    trx?: Knex.Transaction,
  ) {
    const { reciver_ids, ...restData } = data;
    const notificationEntity = new NotificationEntity(restData);

    const { id: notification_id } =
      await this.notificationsRepository.createOne(notificationEntity, trx);

    const userNotificationEntities = reciver_ids.map(
      (reciver_id) =>
        new UserNotificationEntity({
          notification_id,
          reciver_id,
          status: UserNotificationStatus.NEW,
        }),
    );

    await this.userNotificationRepository.createMany(
      userNotificationEntities,
      trx,
    );
    if (reciver_ids.length) {
      await this.queue.add('send-user-notification', {
        result: { id: notification_id },
        receiver_ids: reciver_ids,
      });
    }

    return data;
  }

  public async readNotification(id: number, reciver_id: number) {
    const userNotification = await this.userNotificationRepository.findByParam({
      id,
      reciver_id,
    });

    if (!userNotification) {
      throw new NotFoundException(HTTPMessages.notification.errors.notFound);
    }

    const userNotificationEntity = new UserNotificationEntity(
      userNotification,
    ) as Required<UserNotificationEntity>;

    userNotificationEntity.changeStatus(UserNotificationStatus.READ);

    return this.userNotificationRepository.updateOne(userNotificationEntity);
  }
}
