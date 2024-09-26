import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdatePhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20),
});

export const VerifyPhoneSchema = z.object({
  id: z.number(),
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20),
  code: z.number(),
});

export class UpdatePhoneDto extends createZodDto(UpdatePhoneSchema) {}

export class VerifyPhoneDto extends createZodDto(VerifyPhoneSchema) {}
