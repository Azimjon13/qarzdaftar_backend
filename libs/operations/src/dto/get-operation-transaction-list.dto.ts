import { createZodDto } from 'nestjs-zod';
import { BaseQuerySchema } from './get-operation-list.dto';

export class GetOperationTransactionListDto extends createZodDto(
  BaseQuerySchema,
) {}
