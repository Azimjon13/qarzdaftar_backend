import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseGetMeUserContactsSchema = BaseQuerySchema.extend({
  filter: z
    .object({
      users: z
        .object({
          phone: z.string().optional(),
        })
        .optional(),
      search: z
        .object({
          value: z.string(),
          columns: z.array(
            z.enum([
              'user_contacts.full_name',
              'users.phone',
              'users.first_name',
              'users.last_name',
            ]),
          ),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum([
            'users.id',
            'user_contacts.full_name',
            'users.first_name',
            'users.last_name',
          ]),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class GetMeUserContactsDto extends createZodDto(
  BaseGetMeUserContactsSchema,
) {}
