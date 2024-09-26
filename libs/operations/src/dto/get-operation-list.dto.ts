import { OperationStatus } from 'database/migrations/20240409003340_operations';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BaseQuerySchema = z.object({
  take: z
    .string()
    .regex(/^[0-9]+$/)
    .default('12')
    .transform(Number),
  direction: z.enum(['next', 'prev']).default('next'),
  cursor: z
    .string()
    .regex(/^[0-9]+$/)
    .transform(Number)
    .optional(),
});

const BaseGetOperationListQuery = BaseQuerySchema.extend({
  filter: z
    .object({
      operations: z
        .object({
          status: z.array(z.nativeEnum(OperationStatus)).optional(),
          created_at: z
            .object({
              min: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
              max: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
            })
            .optional(),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum(['operations.id', 'operations.created_at']),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
      search: z
        .object({
          value: z.string(),
          columns: z.array(
            z.enum([
              'lendinger_users.first_name',
              'lendinger_users.last_name',
              'borrowinger_users.first_name',
              'borrowinger_users.last_name',
              'lendinger_users.phone',
              'borrowinger_users.phone',
            ]),
          ),
        })
        .optional(),
    })
    .optional(),
});

export class GetOperationListDto extends createZodDto(
  BaseGetOperationListQuery,
) {}
