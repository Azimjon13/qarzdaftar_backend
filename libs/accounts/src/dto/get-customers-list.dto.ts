import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { UserStatus } from 'database/migrations/20240409001219_users';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetCustomersListQuerySchema = BaseQuerySchema.extend({
  filter: z
    .object({
      users: z
        .object({
          status: z.array(z.nativeEnum(UserStatus)).optional(),
          created_at: z
            .object({
              min: z
                .string()
                .refine((str: string) => {
                  return (
                    /^\d{4}-\d{2}-\d{2}$/.test(str) &&
                    new Date(str).toISOString().startsWith(str)
                  );
                })
                .optional(),
              max: z
                .string()
                .refine((str: string) => {
                  return (
                    /^\d{4}-\d{2}-\d{2}$/.test(str) &&
                    new Date(str).toISOString().startsWith(str)
                  );
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
      search: z
        .object({
          value: z.string(),
          columns: z.array(
            z.enum([
              "users.first_name || ' ' || users.last_name",
              'users.phone',
            ]),
          ),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum([
            'users.id',
            'users.score',
            'users.created_at',
            'active_credits',
            'total_credits',
            'banned_count',
          ]),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class GetCustomersListDto extends createZodDto(
  GetCustomersListQuerySchema,
) {}
