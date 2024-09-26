import { InjectKnex, KnexService } from '@app/knex';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IUserContactModel } from '../models/user-contact.model';
import { GetMeUserContactsDto } from '../dto/get-me-user-contacts.dto';

@Injectable()
export class UserContactsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<IUserContactModel>>('user_contacts')
      : this.knex<Required<IUserContactModel>>('user_contacts');
  }

  public async createMany(
    userContacts: IUserContactModel[],
    trx?: Knex.Transaction,
  ) {
    return await this.getBuilder(trx).insert(userContacts, 'id');
  }

  public async createOne(
    userContact: IUserContactModel,
    trx?: Knex.Transaction,
  ) {
    const created = await this.getBuilder(trx).insert(userContact, 'id');
    return created[0] || null;
  }

  public async updateOne(userContact: Required<IUserContactModel>) {
    const { id, ...partialEntityData } = userContact;
    const updated = await this.getBuilder()
      .where({ id })
      .update(partialEntityData, 'id');
    return updated[0] || null;
  }

  public deleteManyByAuthorId(author_id: number, trx?: Knex.Transaction) {
    return this.getBuilder(trx).where({ author_id }).del('id');
  }

  public findOneByCustomer(author_id: number, customer_id: number) {
    return this.getBuilder()
      .where({ author_id, customer_id })
      .select('*')
      .first();
  }

  public async findAll(
    authorId: number,
    { filter, ...cursorParams }: GetMeUserContactsDto,
  ) {
    const queryBuilder = this.getBuilder()
      .leftJoin('users', 'user_contacts.customer_id', 'users.id')
      .leftJoin(
        'banned_users',
        'user_contacts.customer_id',
        'banned_users.banned_id',
      )
      .select(
        'users.id',
        'user_contacts.full_name',
        'users.first_name as original_first_name',
        'users.last_name as original_last_name',
        'users.phone',
        'users.avatar',
        'users.score',
        this.knex.raw('COUNT(banned_users.id)::int as banned_count'),
        this.knex.raw(
          'CASE WHEN COUNT(CASE WHEN user_contacts.author_id = banned_users.author_id THEN 1 END) = 1 THEN true ELSE false END is_blacklist',
        ),
      )
      .where('user_contacts.author_id', authorId)
      .groupBy('user_contacts.id', 'users.id');

    return KnexService.paginate<
      Required<Omit<IUserContactModel, 'author_id'>> & {
        id: number;
        full_name: string;
        original_first_name: string | null;
        original_last_name: string | null;
        phone: string;
        scope: number | null;
        avatar: string | null;
      }
    >({
      query: KnexService.filter(queryBuilder, filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'users.id',
      },
    });
  }

  public findAllByPhones(userId: number, phones: string[]) {
    return this.getBuilder()
      .whereIn('phone', phones)
      .andWhere('customer_id', userId)
      .select('*');
  }

  public findOneByPhone(author_id: number, customer_id: number) {
    return this.getBuilder()
      .where({ author_id, customer_id })
      .select('*')
      .first();
  }
}
