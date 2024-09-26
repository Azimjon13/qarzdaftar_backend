import { InjectKnex, KnexService } from '@app/knex';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ITransactionModel } from '../models/transaction.model';
import { ContractorType } from '../dto/create-operation.dto';
import { GetOperationTransactionListDto } from '../dto/get-operation-transaction-list.dto';

@Injectable()
export class TransactionsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<ITransactionModel>>('transactions')
      : this.knex<Required<ITransactionModel>>('transactions');
  }

  public async createOne(
    transaction: ITransactionModel,
    trx?: Knex.Transaction,
  ) {
    const created = await this.getBuilder(trx).insert(transaction, 'id');
    return created[0] || null;
  }

  public async updateOne(
    transaction: Required<ITransactionModel>,
    trx?: Knex.Transaction,
  ) {
    const { id, ...partialEntityData } = transaction;
    const updated = await this.getBuilder(trx)
      .where({ id })
      .update(partialEntityData, 'id');
    return updated[0] || null;
  }

  public async findById(id: number) {
    return (await this.getBuilder()
      .where({ id })
      .select(
        'id',
        this.knex.raw('amount::float'),
        'author_id',
        'operation_id',
        'status',
        'type',
        'note',
        'created_at',
      )
      .first()) as unknown as Required<Required<ITransactionModel>>;
  }

  public async findAllOperationId(
    operationId: number,
    { ...cursorParams }: GetOperationTransactionListDto,
  ) {
    const queryBuilder = this.getBuilder()
      .leftJoin('users', 'transactions.author_id', 'users.id')
      .leftJoin('operations', 'transactions.operation_id', 'operations.id')
      .select(
        'transactions.id',
        'transactions.amount',
        'transactions.created_at',
        'transactions.status',
        'operations.currency',
        'users.avatar as author_avatar',
        this.knex.raw(`users.first_name || ' ' || users.last_name author_name`),
        this.knex.raw(
          `CASE
          WHEN operations.lendinger_id = users.id THEN '${ContractorType.LENDING}'
          WHEN operations.borrowinger_id = users.id THEN '${ContractorType.BORROWING}'
          ELSE null
          END author_type`,
        ),
      )
      .where('transactions.operation_id', operationId);

    return KnexService.paginate<
      Required<Pick<ITransactionModel, 'id' | 'amount' | 'created_at'>> & {
        author_name: string;
        author_avatar: string;
        author_type: string;
      }
    >({
      query: KnexService.filter(queryBuilder),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'transactions.id',
      },
    });
  }
}
