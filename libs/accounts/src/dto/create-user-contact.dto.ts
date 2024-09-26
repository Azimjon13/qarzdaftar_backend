import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseCreateUserContactDtoSchema = z.object({
  full_name: z.string().trim(),
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20),
});

export class CreateUserContactDto extends createZodDto(
  BaseCreateUserContactDtoSchema,
) {}
