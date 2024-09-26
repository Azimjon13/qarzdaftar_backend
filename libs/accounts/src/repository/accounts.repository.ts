import { LoginRegisterDto } from '@app/auth/dto/create-auth.dto';
import { InjectKnex, KnexService } from '@app/knex';
import { UserStatus, Role } from 'database/migrations/20240409001219_users';
import { Knex } from 'knex';
import { UpdateProfileAfterVerificationDto } from '../dto/create-account.dto';
import { IUserModel } from '../models/user.model';
import { UpdateAccountSettingsDto } from '../dto/update-settings.dto';
import { GetCustomersListDto } from '../dto/get-customers-list.dto';
import { OperationStatus } from 'database/migrations/20240409003340_operations';
import { GetEmployeesListDto } from '../dto/get-employees-list.dto';
import { GetPopularCustomersDto } from '../dto/get-popular-customers.dto';

export class AccountsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<IUserModel>>('users')
      : this.knex<Required<IUserModel>>('users');
  }

  public async createOne(user: IUserModel, trx?: Knex.Transaction) {
    const created = await this.getBuilder(trx).insert(user, '*');
    return created[0] || null;
  }

  public async updateOne(user: Required<IUserModel>, trx?: Knex.Transaction) {
    const { id, ...partialEntityData } = user;
    const updated = await this.getBuilder(trx)
      .where({ id })
      .update(partialEntityData, 'id');
    return updated[0] || null;
  }

  async createAccount(
    data: LoginRegisterDto,
    role: Role,
    trx?: Knex.Transaction,
  ) {
    const [res] = await this.getBuilder(trx)
      .insert({
        phone: data.phone,
        role,
        status: UserStatus.PENDING,
      })
      .returning('*');

    return res;
  }

  public updateCustomerStatusToBlacklist(bannedCount: number) {
    const subquery = this.knex('banned_users')
      .select('banned_id')
      .havingRaw(`COUNT(banned_id) >= ${bannedCount}`)
      .groupBy('banned_id');
    return this.getBuilder()
      .whereIn('id', subquery)
      .andWhere('status', UserStatus.ACTIVE)
      .update({ status: UserStatus.BLACKLIST });
  }

  public updateCustomerStatusToWhitelist(bannedCount: number) {
    const subquery = this.knex('banned_users')
      .select('banned_id')
      .havingRaw(`COUNT(banned_id) < ${bannedCount}`)
      .groupBy('banned_id');
    return this.getBuilder()
      .whereIn('id', subquery)
      .andWhere('status', UserStatus.BLACKLIST)
      .update({ status: UserStatus.ACTIVE });
  }

  public async createMany(users: IUserModel[], trx?: Knex.Transaction) {
    return this.getBuilder(trx).insert(users, ['id', 'phone']);
  }

  public async findAllCustomerByPhones(phones: string[]) {
    return this.getBuilder()
      .select('id', 'phone')
      .whereIn('phone', phones)
      .andWhere('role', Role.CUSTOMER);
  }

  findByParam(param: Partial<IUserModel>) {
    return this.getBuilder().where(param).select('*').first();
  }

  hardDeleteOneByParams(param: Partial<IUserModel>, trx?: Knex.Transaction) {
    return this.getBuilder(trx).where(param).del('*');
  }

  async findForLoginByItem(item: string, value: any) {
    return this.getBuilder()
      .select(
        'users.id',
        'users.status',
        'passwords.hash as password',
        'users.is_banned',
      )
      .leftJoin('passwords', function () {
        this.on('passwords.user_id', '=', 'users.id').andOnVal(
          'passwords.is_active',
          '=',
          true,
        );
      })
      .where({ [`users.${item}`]: value })
      .whereNot({ 'users.status': UserStatus.DELETE })
      .first();
  }

  async updateAccountByParam(
    param: Partial<IUserModel>,
    data: UpdateProfileAfterVerificationDto,
    trx?: Knex.Transaction,
  ) {
    const [res] = await this.getBuilder(trx)
      .where(param)
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
      })
      .returning('*');
    return res;
  }

  findAllByCustomer({ filter, ...cursorParams }: GetCustomersListDto) {
    const queryBuilder = this.getBuilder()
      .select(
        'users.id',
        'users.score',
        'users.phone',
        'users.telegram_id',
        'users.status',
        'users.created_at',
        this.knex.raw(
          "users.first_name || ' ' || users.last_name as full_name",
        ),
        this.knex.raw(
          `COUNT(CASE WHEN operations.status = '${OperationStatus.ACTIVE}' THEN 1 END)::int as active_credits`,
        ),
        this.knex.raw('COUNT(operations.borrowinger_id)::int as total_credits'),
        this.knex.raw('COUNT(banned_users.banned_id)::int as banned_count'),
      )
      .leftJoin('operations', 'users.id', 'operations.borrowinger_id')
      .leftJoin('banned_users', 'users.id', 'banned_users.banned_id')
      .where('users.role', Role.CUSTOMER)
      .groupBy('users.id');

    return KnexService.paginate({
      query: KnexService.filter(queryBuilder, filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'users.id',
      },
    });
  }

  findAllTopScoreCustomer({ filter, ...cursorParams }: GetPopularCustomersDto) {
    const queryBuilder = this.getBuilder()
      .select(
        'id',
        'score',
        'avatar',
        this.knex.raw("first_name || ' ' || last_name full_name"),
      )
      .whereNot({ score: 0 })
      .andWhere({ status: UserStatus.ACTIVE });

    return KnexService.paginate({
      query: KnexService.filter(queryBuilder, filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'users.id',
      },
    });
  }

  findOneEmployeeById(id: number) {
    return this.getBuilder()
      .where({ id, role: Role.EMPLOYEE })
      .select(
        'id',
        'role',
        'first_name',
        'last_name',
        'phone',
        'avatar',
        'gender',
      )
      .first();
  }

  findAllByEmployee({ filter, ...cursorParams }: GetEmployeesListDto) {
    const queryBuilder = this.getBuilder()
      .select(
        'id',
        'role',
        this.knex.raw(`first_name || ' ' || last_name full_name`),
        'avatar',
        'is_banned',
        'status',
        'created_at',
      )
      .whereNot('role', Role.CUSTOMER)
      .whereNot('status', UserStatus.DELETE);

    return KnexService.paginate({
      query: KnexService.filter(queryBuilder, filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'users.id',
      },
    });
  }

  async updateAccountSettings(user_id: number, data: UpdateAccountSettingsDto) {
    const [res] = await this.getBuilder()
      .where({ id: user_id })
      .update({
        meta: data,
      })
      .returning('*');
    return res;
  }

  accountPayload(id: number) {
    return this.getBuilder().where({ id }).select('*').first();
  }
}
