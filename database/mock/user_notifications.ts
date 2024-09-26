import { UserNotificationStatus } from '../migrations/20240409005321_user_notifications';

export const notification_accounts = [
  {
    reciver_id: 2,
    notification_id: 1,
    status: UserNotificationStatus.NEW,
  },
  {
    reciver_id: 2,
    notification_id: 2,
    status: UserNotificationStatus.NEW,
  },
];
