import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IOperationModel } from '../models/operation.model';
import { GetOperationListDto } from '../dto/get-operation-list.dto';
import { InjectKnex, KnexService } from '@app/knex';
import { ContractorType } from '../dto/create-operation.dto';
import { OperationStatus } from 'database/migrations/20240409003340_operations';
import { GetMeGraphicStatisticsDto } from '../dto/get-me-graphic-statistics.dto';

@Injectable()
export class OperationsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<IOperationModel>>('operations')
      : this.knex<Required<IOperationModel>>('operations');
  }

  public async createOne(operation: IOperationModel, trx?: Knex.Transaction) {
    const created = await this.getBuilder(trx).insert(operation, 'id');
    return created[0] || null;
  }

  public async updateOne(
    operation: Required<IOperationModel>,
    trx?: Knex.Transaction,
  ) {
    const { id, ...partialEntity } = operation;
    const updated = await this.getBuilder(trx)
      .where({ id })
      .update(partialEntity, 'id');
    return updated[0] || null;
  }

  public async findAllByUserId(
    userId: number,
    { filter, ...cursorParams }: GetOperationListDto,
  ) {
    return KnexService.paginate<
      Required<
        Omit<
          IOperationModel,
          | 'actioned_at'
          | 'actioner_id'
          | 'creator_id'
          | 'medias_ids'
          | 'status'
          | 'description'
        > & {
          contractor_avatar: string;
          contractor_full_name: string;
          contractor_type: ContractorType;
        }
      >
    >({
      query: KnexService.filter(this.baseFindQuery(userId), filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'operations.id',
      },
    });
  }

  public async findById(userId: number, id: number) {
    return (await this.getBuilder()
      .select(
        'id',
        'lendinger_id',
        'borrowinger_id',
        'actioner_id',
        'creator_id',
        'currency',
        'deadline',
        'description',
        'is_blacklist',
        this.knex.raw('amount::float'),
        this.knex.raw('debt::float'),
        'medias_ids',
        'status',
        'actioned_at',
        'created_at',
      )
      .where({ id })
      .andWhere((builder) => {
        builder.where({ lendinger_id: userId });
        builder.orWhere({ borrowinger_id: userId });
      })
      .first()) as unknown as Required<IOperationModel> | undefined;
  }

  public async findOneByUserId(id: number, userId: number) {
    const queryBuilder = this.baseFindQuery(userId)
      .select(
        'operations.created_at',
        'operations.medias_ids',
        this.knex.raw(
          `CASE 
      WHEN operations.lendinger_id = ${userId} THEN borrowinger_users.score
      WHEN operations.borrowinger_id = ${userId} THEN lendinger_users.score
      ELSE null
      END contractor_score`,
        ),
        this.knex.raw(
          `CASE 
      WHEN operations.lendinger_id = ${userId} THEN borrowinger_users.phone
      WHEN operations.borrowinger_id = ${userId} THEN lendinger_users.phone
      ELSE null
      END contractor_phone`,
        ),
      )
      .andWhere('operations.id', id)
      .first();

    return (await queryBuilder) as unknown as Required<
      Omit<IOperationModel, 'actioner_id' | 'actioned_at' | 'description'> & {
        contractor_avatar: string;
        contractor_full_name: string;
        contractor_phone: string;
        contractor_score: number;
        contractor_type: ContractorType;
      }
    >;
  }

  public async findAllStatistics(
    key: keyof Pick<IOperationModel, 'lendinger_id' | 'borrowinger_id'>,
    value: number,
  ) {
    const queryBuilder = this.getBuilder()
      .where(`operations.${key}`, value)
      .andWhere({ status: OperationStatus.ACTIVE })
      .select('currency')
      .sum('amount as amount')
      .groupBy('currency')
      .orderBy('currency');
    return queryBuilder;
  }

  public async findAllStatisticsByDays(
    userId: number,
    { filter }: GetMeGraphicStatisticsDto,
  ) {
    const subquery = this.getBuilder()
      .andWhere((builder) => {
        builder
          .where({ borrowinger_id: userId })
          .orWhere({ lendinger_id: userId });
      })
      .select(
        'currency',
        'amount',
        'created_at',
        this.knex.raw(
          `CASE
          WHEN operations.lendinger_id = ${userId} THEN 'taken'
          WHEN operations.borrowinger_id = ${userId} THEN 'given'
          ELSE null
          END type`,
        ),
      );

    const subqueryWithFilter = KnexService.filter(subquery, filter);

    const subquery2 = this.knex
      .from(subqueryWithFilter)
      .select(this.knex.raw('created_at::date as date'), 'type')
      .sum('amount as amount')
      .groupBy('type')
      .groupByRaw('created_at::date');

    const queryBuilder = this.knex
      .from(subquery2)
      .select(
        'date',
        this.knex.raw(
          `jsonb_agg(
            jsonb_build_object(
              'type', type,
              'amount', amount
            )
          ) as statistics`,
        ),
      )
      .groupBy('date');

    return (await queryBuilder) as {
      date: Date;
      statistics: { type: string; amount: number };
    }[];
  }

  public async findCountDeadlineExpired(
    lendinger_id: number,
    borrowinger_id: number,
    trx?: Knex.Transaction,
  ) {
    const queryBuilder = this.getBuilder(trx)
      .where({
        lendinger_id,
        borrowinger_id,
        status: OperationStatus.ACTIVE,
        is_blacklist: true,
      })
      .andWhere('deadline', '<', new Date())
      .select(this.knex.raw('COUNT(*)::int'))
      .first();

    return (await queryBuilder) as unknown as { count: number };
  }

  public async findCountByCreatedDate(
    countType: 'active_or_closed' | 'closed_not_expired',
    optionsFilter: Required<
      Pick<IOperationModel, 'lendinger_id' | 'borrowinger_id' | 'created_at'>
    >,
    trx?: Knex.Transaction,
  ) {
    const { created_at, ...restOptions } = optionsFilter;
    const queryBuilder = this.getBuilder(trx)
      .where({ ...restOptions })
      .andWhereRaw('created_at::date = ?', [
        created_at.toISOString().split('T')[0],
      ])
      .select(this.knex.raw('COUNT(*)::int'))
      .first();

    if (countType === 'active_or_closed') {
      queryBuilder.andWhere((builder) => {
        builder.where('status', OperationStatus.ACTIVE);
        builder.orWhere('status', OperationStatus.CLOSED);
      });
    }

    if (countType === 'closed_not_expired') {
      queryBuilder
        .andWhere('status', OperationStatus.CLOSED)
        .andWhereRaw('deadline > closed_at');
    }

    return (await queryBuilder) as unknown as { count: number };
  }

  private baseFindQuery(userId: number) {
    return this.getBuilder()
      .leftJoin(
        'users as lendinger_users',
        'operations.lendinger_id',
        'lendinger_users.id',
      )
      .leftJoin(
        'users as borrowinger_users',
        'operations.borrowinger_id',
        'borrowinger_users.id',
      )
      .select(
        'operations.id',
        this.knex.raw('operations.amount::float'),
        this.knex.raw('operations.debt::float'),
        'operations.deadline',
        'operations.currency',
        'operations.status',
        this.knex.raw(
          `CASE 
        WHEN operations.lendinger_id = ${userId} THEN borrowinger_users.first_name || ' ' || borrowinger_users.last_name
        WHEN operations.borrowinger_id = ${userId} THEN lendinger_users.first_name || ' ' || lendinger_users.last_name
        ELSE null
        END contractor_full_name`,
        ),
        this.knex.raw(
          `CASE 
        WHEN operations.lendinger_id = ${userId} THEN borrowinger_users.avatar
        WHEN operations.borrowinger_id = ${userId} THEN lendinger_users.avatar
        ELSE null
        END contractor_avatar`,
        ),
        this.knex.raw(
          `CASE
        WHEN operations.lendinger_id = ${userId} THEN '${ContractorType.BORROWING}'
        WHEN operations.borrowinger_id = ${userId} THEN '${ContractorType.LENDING}'
        ELSE null
        END contractor_type`,
        ),
      )
      .andWhere((build) => {
        build.where('operations.lendinger_id', userId);
        build.orWhere('operations.borrowinger_id', userId);
      });
  }
}
