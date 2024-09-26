import { UserNotificationStatus } from 'database/migrations/20240409005321_user_notifications';
import { IUserNotificationModel } from '../models/user-notification.model';

export class UserNotificationEntity implements IUserNotificationModel {
  id?: number;
  notification_id: number;
  reciver_id: number;
  status: UserNotificationStatus;

  constructor(userNotification: IUserNotificationModel) {
    this.id = userNotification.id;
    this.notification_id = userNotification.notification_id;
    this.reciver_id = userNotification.reciver_id;
    this.status = userNotification.status;
  }

  public changeStatus(status: UserNotificationStatus) {
    this.status = status;
  }
}
