import { TransactionType } from 'database/migrations/20240409005036_transactions';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BaseOperationPaySchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  note: z.string().optional(),
});

export class OperationPayDto extends createZodDto(BaseOperationPaySchema) {}
