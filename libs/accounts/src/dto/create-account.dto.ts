import { Gender, Role } from 'database/migrations/20240409001219_users';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProfileAfterVerificationSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.string().optional(),
});

export const CreateEmployeeSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  role: z.enum([Role.EMPLOYEE, Role.SUPER_ADMIN]),
  avatar: z.string().optional(),
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20),
  password: z.string(),
});

export class UpdateProfileAfterVerificationDto extends createZodDto(
  UpdateProfileAfterVerificationSchema,
) {}

export class CreateEmployeeDto extends createZodDto(CreateEmployeeSchema) {}
