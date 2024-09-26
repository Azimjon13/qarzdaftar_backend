import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUpdateLanguageSchema = z.object({
  name: z.string(),
  flag: z.string().optional(),
  code: z.string(),
  is_default: z.boolean().default(false),
});

export class CreateUpdateTranslationsDto extends createZodDto(
  CreateUpdateLanguageSchema,
) {}
