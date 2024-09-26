import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { UserNotificationStatus } from 'database/migrations/20240409005321_user_notifications';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UserNotificationQuerySchema = BaseQuerySchema.extend({
  filter: z
    .object({
      user_notifications: z
        .object({
          status: z.array(z.nativeEnum(UserNotificationStatus)).optional(),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum(['user_notifications.id', 'notifications.created_at']),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class UserNotificationQueryDto extends createZodDto(
  UserNotificationQuerySchema,
) {}
