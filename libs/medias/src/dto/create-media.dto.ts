import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MediaParamSchema = z.object({
  filename: z.string().uuid(),
});

export const MediaSchema = z.object({
  tag: z.enum(['operations', 'accounts', 'transactions', 'translations']),
});

export class CreateMediaDto extends createZodDto(MediaSchema) {}

export class MediaParamSchemaDto extends createZodDto(MediaParamSchema) {}
