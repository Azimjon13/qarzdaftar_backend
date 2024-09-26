import { NotificationType } from 'database/migrations/20240409005250_notifications';
import { INotificationModel } from '../models/notification.model';

export class NotificationEntity implements INotificationModel {
  id?: number;
  title: string;
  description?: string;
  author_id: number;
  item_id: number;
  item_type: NotificationType;
  created_at?: Date;

  constructor(notification: INotificationModel) {
    this.id = notification.id;
    this.title = notification.title;
    this.description = notification.description;
    this.author_id = notification.author_id;
    this.item_id = notification.item_id;
    this.item_type = notification.item_type;
    this.created_at = notification.created_at;
  }
}
