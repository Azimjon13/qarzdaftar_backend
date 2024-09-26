import { Currency } from 'database/migrations/20240409003340_operations';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export enum ContractorType {
  LENDING = 'lending',
  BORROWING = 'borrowing',
}

const BaseCreateOperationSchema = z.object({
  contractor_id: z.number().positive(),
  contractor_type: z.nativeEnum(ContractorType),
  amount: z.number().positive(),
  deadline: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  is_blacklist: z.boolean(),
  description: z.string().optional(),
  medias_ids: z.array(z.string()).optional(),
  currency: z.nativeEnum(Currency),
});

export class CreateOperationDto extends createZodDto(
  BaseCreateOperationSchema,
) {}
