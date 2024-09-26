import { InjectKnex, KnexService } from '@app/knex';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IBannedUserModel } from '../models/banned-user.model';
import { OperationStatus } from 'database/migrations/20240409003340_operations';
import { GetMeBannedListDto } from '../dto/get-me-banned-list.dto';

@Injectable()
export class BannedUsersRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<IBannedUserModel>>('banned_users')
      : this.knex<Required<IBannedUserModel>>('banned_users');
  }

  public async createManySelectOperation() {
    return this.knex
      .from(
        this.knex.raw('?? (??, ??, ??)', [
          'banned_users',
          'author_id',
          'banned_id',
          'score',
        ]),
      )
      .insert(function () {
        this.from('operations')
          .leftJoin('users', 'operations.borrowinger_id', 'users.id')
          .select(
            'operations.lendinger_id as author_id',
            'operations.borrowinger_id as banned_id',
            'users.score',
          )
          .whereNotIn(
            ['operations.lendinger_id', 'operations.borrowinger_id'],
            function () {
              this.from('banned_users').select('author_id', 'banned_id');
            },
          )
          .andWhere('operations.deadline', '<', new Date())
          .andWhere('operations.is_blacklist', true)
          .andWhere('operations.status', OperationStatus.ACTIVE)
          .groupBy(
            'operations.borrowinger_id',
            'operations.lendinger_id',
            'users.id',
          );
      });
  }

  public deleteOneByAuthorId(
    author_id: number,
    banned_id: number,
    trx?: Knex.Transaction,
  ) {
    return this.getBuilder(trx).where({ author_id, banned_id }).del('id');
  }

  public async findCount(banned_id: number) {
    const queryBuilder = this.getBuilder()
      .where({ banned_id })
      .select(this.knex.raw('COUNT(*)::int'))
      .first();

    return (await queryBuilder) as unknown as { count: number };
  }

  public async findAllByAuthor(
    author_id: number,
    { filter }: GetMeBannedListDto,
  ) {
    const queryBuilder = this.getBuilder()
      .leftJoin('users', 'banned_users.banned_id', 'users.id')
      .select(
        'users.id',
        'users.avatar',
        'users.score',
        this.knex.raw(`users.first_name || ' ' || users.last_name full_name`),
      )
      .where('banned_users.author_id', author_id);

    return (await KnexService.filter(queryBuilder, filter)) as {
      id: number;
      full_name: string;
      avatar: string;
      score: string;
    }[];
  }
}
