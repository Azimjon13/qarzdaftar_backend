import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseCreateMultipleContactSchema = z.array(
  z.object({
    phone: z
      .string()
      .regex(/^[0-9]+$/)
      .max(20),
    full_name: z.string().trim(),
  }),
);

export class CreateMultipleContactDto extends createZodDto(
  BaseCreateMultipleContactSchema,
) {}
