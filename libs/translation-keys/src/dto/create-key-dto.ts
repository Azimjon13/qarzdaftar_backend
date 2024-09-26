import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateLanguageKeysSchema = z.object({
  keys: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .min(1),
});

export class CreateKeyDto extends createZodDto(CreateLanguageKeysSchema) {}
