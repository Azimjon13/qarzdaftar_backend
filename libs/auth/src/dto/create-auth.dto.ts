import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20)
    .optional(),
});

export const LoginSchemaS = LoginSchema.extend({
  first_name: z.string(),
  last_name: z.string(),
});

export const ConfirmationCodeSchema = z.object({
  id: z.number(),
  code: z.number(),
});

export const ResendCodeSchema = z.object({
  id: z.number(),
});

export const LoginWebSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20)
    .optional(),
  password: z.string(),
});

export const TelegramAuthCallbackQuerySchema = z.object({
  id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.string(),
  hash: z.string(),
});

export const TelegramAuthSchema = z.object({
  tg_user_id: z.string(),
  phone: z
    .string()
    .regex(/^[0-9]+$/)
    .max(20),
});

export class LoginRegisterDto extends createZodDto(LoginSchema) {}

export class VerificationDto extends createZodDto(ConfirmationCodeSchema) {}

export class ResendVerificationCode extends createZodDto(ResendCodeSchema) {}

export class LoginWebDto extends createZodDto(LoginWebSchema) {}

export class TelegramAuthCallbackDto extends createZodDto(
  TelegramAuthCallbackQuerySchema,
) {}

export class TelegramAuthDto extends createZodDto(TelegramAuthSchema) {}
