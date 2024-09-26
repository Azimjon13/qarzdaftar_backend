import { NotificationType } from 'database/migrations/20240409005250_notifications';

export interface INotificationModel {
  id?: number;
  title: string;
  description?: string | null;
  author_id: number;
  item_id: number;
  item_type: NotificationType;
  created_at?: Date;
}
