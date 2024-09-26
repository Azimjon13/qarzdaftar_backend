import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';
import { ActivityInterceptor } from '../interceptors/activity.interceptor';

export interface IActivityData {
  item_type: ActivityType;
  action_type: ActivityActionType;
  description: string;
}

export const ACTIVITY_DATA_KEY = 'activity_data_key';
export const Activity = (data: IActivityData) =>
  applyDecorators(
    SetMetadata(ACTIVITY_DATA_KEY, data),
    UseInterceptors(ActivityInterceptor),
  );
