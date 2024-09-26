import { UserNotificationStatus } from 'database/migrations/20240409005321_user_notifications';

export interface IUserNotificationModel {
  id?: number;
  notification_id: number;
  reciver_id: number;
  status: UserNotificationStatus;
}
