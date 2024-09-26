import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LanguageKeyValueSchema = z.object({
  key_id: z.number(),
  value: z.string(),
});

export const CreateUpdateLanguageValueSchema = z.object({
  items: z.array(LanguageKeyValueSchema).min(1),
});

export class Translations extends createZodDto(
  CreateUpdateLanguageValueSchema,
) {}
