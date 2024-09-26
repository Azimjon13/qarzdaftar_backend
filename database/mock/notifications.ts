import { NotificationType } from '../migrations/20240409005250_notifications';

export const notifications = [
  {
    title: 'new notification',
    author_id: 1,
    description: 'Operation tastiqladi',
    item_id: 1,
    item_type: NotificationType.OPERATION,
  },
  {
    title: 'new notification 2',
    description: 'Transaction tastiqladi',
    author_id: 2,
    item_id: 2,
    item_type: NotificationType.TRANSACTION,
  },
];
