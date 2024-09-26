import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseGetMeBannedListDtoSchema = z.object({
  filter: z
    .object({
      users: z
        .object({
          phone: z.string().optional(),
        })
        .optional(),
      banned_users: z
        .object({
          created_at: z
            .object({
              min: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
              max: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
            })
            .optional(),
        })
        .optional(),
      search: z
        .object({
          value: z.string(),
          columns: z.array(z.enum(['users.first_name', 'users.last_name'])),
        })
        .optional(),
    })
    .optional(),
});

export class GetMeBannedListDto extends createZodDto(
  BaseGetMeBannedListDtoSchema,
) {}
