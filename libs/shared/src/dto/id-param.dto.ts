import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for validating request parameters with an `id` field.
 */
export const IdParamSchema = z
  .object({
    id: z
      .string()
      .regex(/^\d+$/, {
        message: 'Invalid id provided',
      })
      .transform(Number),
  })
  .required();

export class IdParamDto extends createZodDto(IdParamSchema) {}
