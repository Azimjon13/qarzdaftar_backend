import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';
import { IActivityModel } from './activity.model';

export class ActivityEntity implements IActivityModel {
  id?: number;
  user_id: number;
  item_id?: number;
  item_type: ActivityType;
  description: string;
  action_type: ActivityActionType;
  created_at?: Date;

  constructor(activity: IActivityModel) {
    this.id = activity.id;
    this.user_id = activity.user_id;
    this.item_id = activity.item_id;
    this.item_type = activity.item_type;
    this.description = activity.description;
    this.action_type = activity.action_type;
    this.created_at = activity.created_at;
  }
}
