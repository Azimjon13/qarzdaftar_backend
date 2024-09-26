import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseUpdateSettingsSchema = z.object({
  global_blacklist_count: z.number().positive().optional(),
  local_blacklist_count: z.number().positive().optional(),
});

export class UpdateSettingsDto extends createZodDto(BaseUpdateSettingsSchema) {}
