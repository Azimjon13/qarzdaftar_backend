import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MobileNotificationsController } from './mobile-notifications.controller';
import { UserNotificationRepository } from './repository/user-notification.repository';
import { AccountsModule } from '@app/accounts';
import { NotificationsRepository } from './repository/notifications.repository';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    AccountsModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  controllers: [MobileNotificationsController],
  providers: [
    NotificationsService,
    UserNotificationRepository,
    NotificationsRepository,
  ],
  exports: [
    NotificationsService,
    UserNotificationRepository,
    NotificationsRepository,
  ],
})
export class NotificationsModule {}
