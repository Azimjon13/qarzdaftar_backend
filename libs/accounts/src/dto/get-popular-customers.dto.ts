import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetPopularCustomersQuerySchema = BaseQuerySchema.extend({
  filter: z
    .object({
      sort: z
        .object({
          column: z.enum(['score']),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class GetPopularCustomersDto extends createZodDto(
  GetPopularCustomersQuerySchema,
) {}
