import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseEditOperationDeadlineSchema = z.object({
  deadline: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .optional(),
  is_blacklist: z.boolean().optional(),
});

export class EditOperationDeadlineDto extends createZodDto(
  BaseEditOperationDeadlineSchema,
) {}
