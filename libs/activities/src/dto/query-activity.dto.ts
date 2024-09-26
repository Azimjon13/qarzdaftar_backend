import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const QueryActivitySchema = BaseQuerySchema.extend({
  filter: z
    .object({
      activities: z
        .object({
          created_at: z
            .object({
              min: z.string().optional(),
              max: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      search: z
        .object({
          value: z.string(),
          columns: z.array(
            z.enum([
              'activities.title',
              'activities.description',
              'users.first_name',
              'users.last_name',
            ]),
          ),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum(['activities.id', 'activities.created_at']),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class QueryActivityDto extends createZodDto(QueryActivitySchema) {}
