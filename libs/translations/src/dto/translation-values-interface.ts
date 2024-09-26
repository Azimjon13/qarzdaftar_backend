import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BaseTranslationValuesSchema = z.object({
  translation_id: z.number().min(1),
  translation_key_id: z.number().min(1),
  value: z.string(),
});

export class TranslationValues extends createZodDto(
  BaseTranslationValuesSchema,
) {}
