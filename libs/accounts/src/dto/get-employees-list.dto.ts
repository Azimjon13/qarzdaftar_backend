import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetEmployeesListQuerySchema = BaseQuerySchema.extend({
  filter: z
    .object({
      search: z
        .object({
          value: z.string(),
          columns: z.array(
            z.enum([
              "users.first_name || ' ' || users.last_name",
              'users.role',
              'users.status',
            ]),
          ),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum(['users.id', 'users.created_at']),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class GetEmployeesListDto extends createZodDto(
  GetEmployeesListQuerySchema,
) {}
