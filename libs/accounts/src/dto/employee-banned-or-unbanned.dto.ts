import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const EmployeeBannedOrUnbannedSchema = z.object({
  is_banned: z.boolean(),
});

export class EmployeeBannedOrUnbanned extends createZodDto(
  EmployeeBannedOrUnbannedSchema,
) {}
