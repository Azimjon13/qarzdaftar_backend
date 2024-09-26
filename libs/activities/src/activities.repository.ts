import { InjectKnex, KnexService } from '@app/knex';
import { Knex } from 'knex';
import { Injectable } from '@nestjs/common';
import { IActivityModel } from './activity.model';
import { QueryActivityDto } from './dto/query-activity.dto';
import { IUserModel } from '@app/accounts/models/user.model';

@Injectable()
export class ActivitiesRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<IActivityModel>>('activities')
      : this.knex<Required<IActivityModel>>('activities');
  }

  public async createOne(activity: IActivityModel) {
    const created = await this.getBuilder().insert(activity, 'id');
    return created[0] || null;
  }

  public async findAll(query: QueryActivityDto) {
    const baseQuery = this.getBuilder()
      .select(
        'activities.id',
        'activities.description',
        'activities.action_type',
        'activities.item_type',
        'activities.created_at',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
        'users.avatar as user_avatar',
        'users.role',
        'users.is_banned',
      )
      .leftJoin('users', 'activities.user_id', 'users.id')
      .orderBy('activities.id', 'desc');

    return KnexService.paginate<
      Omit<IActivityModel, 'user_id'> &
        Pick<IUserModel, 'role' | 'is_banned'> & {
          user_first_name: number;
          user_last_name: number;
          user_avatar: string;
        }
    >({
      query: KnexService.filter(
        baseQuery,
        query.filter ? (query.filter as any) : {},
      ),
      cursorParams: {
        take: query.take,
        direction: query.direction,
        cursor: query.cursor,
      },
      options: {
        key: 'id',
        keyPrefix: 'activities.id',
      },
    });
  }
}
