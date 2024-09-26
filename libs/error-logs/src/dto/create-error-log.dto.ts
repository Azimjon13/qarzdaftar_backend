import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateErrorLogSchema = z.object({
  error: z.string(),
});

export class CreateErrorLogDto extends createZodDto(CreateErrorLogSchema) {}
