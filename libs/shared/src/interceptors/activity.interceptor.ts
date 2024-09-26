import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ACTIVITY_DATA_KEY,
  IActivityData,
} from '../decorators/activity.decorator';
import { ActivitiesService } from '@app/activities';
import { tap } from 'rxjs/operators';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const activityData = this.reflector.getAllAndOverride<IActivityData>(
      ACTIVITY_DATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          let item_id: number | undefined = undefined;

          if ('id' in responseData) {
            item_id = responseData.id;
          }

          await this.activitiesService.createActivity({
            ...activityData,
            item_id,
            user_id: req.user.id,
          });
        } catch (e) {}
      }),
    );
  }
}
