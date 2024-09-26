import { BaseQuerySchema } from '@app/operations/dto/get-operation-list.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetErrorLogsQuerySchema = BaseQuerySchema.extend({
  filter: z
    .object({
      search: z
        .object({
          value: z.string(),
          columns: z.array(z.enum(['error_logs.error'])),
        })
        .optional(),
      sort: z
        .object({
          column: z.enum(['error_logs.id']),
          order: z.enum(['asc', 'desc']),
        })
        .optional(),
    })
    .optional(),
});

export class GetErrorLogsDto extends createZodDto(GetErrorLogsQuerySchema) {}
