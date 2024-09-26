import {
  Currency,
  OperationStatus,
} from 'database/migrations/20240409003340_operations';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseGetMeGraphicStatisticsQuery = z.object({
  filter: z
    .object({
      operations: z
        .object({
          currency: z.nativeEnum(Currency).optional(),
          status: z.array(z.nativeEnum(OperationStatus)).optional(),
          created_at: z.object({
            min: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
            max: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
          }),
        })
        .optional(),
    })
    .optional(),
});

export class GetMeGraphicStatisticsDto extends createZodDto(
  BaseGetMeGraphicStatisticsQuery,
) {}
