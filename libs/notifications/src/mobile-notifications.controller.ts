import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { User } from '@app/shared/decorators/user.decorator';
import { Activity } from '@app/shared/decorators/activity.decorator';
import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';
import { activityMessages } from '@app/shared/constants/activity-messages';
import { UserNotificationQueryDto } from './dto/query-notification.dto';

@Controller('mobile/notifications')
export class MobileNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/me')
  @Activity({
    item_type: ActivityType.NOTIFICATION,
    action_type: ActivityActionType.READ,
    description: activityMessages.notifications.readList,
  })
  findAll(
    @User('id') userId: number,
    @Query() userNotificationQueryDto: UserNotificationQueryDto,
  ) {
    return this.notificationsService.findAll(userId, userNotificationQueryDto);
  }

  @Patch('/:id/read')
  @Activity({
    item_type: ActivityType.NOTIFICATION,
    action_type: ActivityActionType.UPDATE,
    description: activityMessages.notifications.makeRead,
  })
  readNotification(@User('id') userId: number, @Param() { id }: IdParamDto) {
    return this.notificationsService.readNotification(id, userId);
  }
}
