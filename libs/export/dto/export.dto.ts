import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ExportQuerySchema = z.object({
  filter: z.enum(['activities', 'employees']),
});

export class ExportDto extends createZodDto(ExportQuerySchema) {}
