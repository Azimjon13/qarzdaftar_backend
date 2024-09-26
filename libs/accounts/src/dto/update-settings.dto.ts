import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateAccountSettingsParamSchema = z.object({
  type: z.enum(['notification', 'language', 'theme']),
});

export const UpdateAccountThemeSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

export const UpdateAccountLanguageSchema = z.object({
  language: z.enum(['en', 'uz', 'ru']),
});

export class UpdateAccountSettingsParamDto extends createZodDto(
  UpdateAccountSettingsParamSchema,
) {}

export class UpdateAccountSettingsDto extends createZodDto(
  z.object({
    notification: z
      .object({
        notification: z.boolean(),
      })
      .optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.enum(['en', 'uz', 'ru']).optional(),
  }),
) {}
