import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';

export interface IActivityModel {
  id?: number;
  user_id: number;
  item_id?: number | null;
  item_type: ActivityType;
  description: string;
  action_type: ActivityActionType;
  created_at?: Date;
}
