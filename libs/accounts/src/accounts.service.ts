import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AccountsRepository } from './repository/accounts.repository';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UserContactsRepository } from './repository/user-contacts.repository';
import { HTTPMessages } from '@app/shared/constants/http-messages';
import { UserContactEntity } from './entities/user-contact.entity';
import { GetMeUserContactsDto } from './dto/get-me-user-contacts.dto';
import { CreateMultipleContactDto } from './dto/create-multiple-contact.dto';
import {
  TransactionsService as KnexTransactionsService,
  TransactionsService,
} from '@app/shared/services/transactions.service';
import { UserEntity } from './entities/user.entity';
import { UserStatus, Role } from 'database/migrations/20240409001219_users';
import { Knex } from 'knex';
import {
  CreateEmployeeDto,
  UpdateProfileAfterVerificationDto,
} from './dto/create-account.dto';
import {
  UpdateAccountSettingsDto,
  UpdateAccountSettingsParamDto,
} from './dto/update-settings.dto';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '@app/shared';
import * as bcrypt from 'bcrypt';
import { PasswordsRepository } from './repository/password.repository';
import { textReplace } from '@app/shared/utils/text-replace';
import { SMSMessages } from '@app/shared/constants/sms-messages';
import { GetCustomersListDto } from './dto/get-customers-list.dto';
import { GetEmployeesListDto } from './dto/get-employees-list.dto';
import { EmployeeBannedOrUnbanned } from './dto/employee-banned-or-unbanned.dto';
import { GetPopularCustomersDto } from './dto/get-popular-customers.dto';
import { UpdatePhoneDto, VerifyPhoneDto } from './dto/update-phone.dto';
import { AuthService } from '@app/auth';
import { VerificationsRepository } from '@app/auth/repositories/verification.repository';
import { VerificationStatus } from 'database/migrations/20240409005232_verifications';

@Injectable()
export class AccountsService {
  private isProd = new RegExp('true').test(
    this.configService.get('IS_PRODUCTION') as any,
  );

  constructor(
    private readonly accountRepository: AccountsRepository,
    private readonly userContactsRepository: UserContactsRepository,
    private readonly knexTransactionsService: KnexTransactionsService,
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
    private readonly smsService: SmsService,
    private readonly passwordsRepository: PasswordsRepository,
    private readonly authService: AuthService,
    private readonly verificationRepository: VerificationsRepository,
  ) {}

  async createEmployee(dto: Required<CreateEmployeeDto>) {
    const { phone, ...restDto } = dto;
    return this.transactionsService.useTransaction(async (trx) => {
      const hasAccount = await this.accountRepository.findByParam({
        phone,
      });

      if (hasAccount) {
        throw new NotFoundException(HTTPMessages.user.errors.alreadyExist);
      }

      const newEmployee = new UserEntity({
        ...restDto,
        phone,
        status: UserStatus.PENDING,
      });

      const res = await this.accountRepository.createOne(newEmployee, trx);

      const passwordHash: string = await bcrypt.hash(dto.password, 10);

      await this.passwordsRepository.insertAndUpdate(res.id, passwordHash, trx);

      if (this.isProd) {
        await this.smsService.send({
          phone: dto.phone as unknown as number,
          code: dto.password as unknown as number,
          text: textReplace(SMSMessages.send.login, [dto.password]),
        });
      }

      return { id: res.id };
    });
  }

  public async userScoreUp(userId: number, trx?: Knex.Transaction) {
    const user = await this.accountRepository.findByParam({ id: userId });
    if (!user) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }
    const userEntity = new UserEntity(user) as Required<UserEntity>;
    userEntity.scoreUp(); // 1 ga ko'taramiza
    return this.accountRepository.updateOne(userEntity, trx);
  }

  public getProfile(account_id: number) {
    return this.accountRepository.findByParam({ id: account_id });
  }

  public getCustomerList(dto: GetCustomersListDto) {
    return this.accountRepository.findAllByCustomer(dto);
  }

  public getEmployeeList(dto: GetEmployeesListDto) {
    return this.accountRepository.findAllByEmployee(dto);
  }

  public getPopularCustomers(dto: GetPopularCustomersDto) {
    return this.accountRepository.findAllTopScoreCustomer(dto);
  }

  public async getOneEmployee(id: number) {
    const result = await this.accountRepository.findOneEmployeeById(id);

    if (!result) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }
    return result;
  }

  public async deleteEmployee(id: number) {
    const hasAccount = await this.accountRepository.findByParam({
      id,
      role: Role.EMPLOYEE,
    });
    if (!hasAccount) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }

    if (hasAccount.status === UserStatus.DELETE) {
      throw new BadRequestException(HTTPMessages.user.errors.alreadyDeleted);
    }

    const deleteUser = new UserEntity(hasAccount) as Required<UserEntity>;
    deleteUser.deleteEmployeeData({ id });

    return this.accountRepository.updateOne(deleteUser);
  }

  public async employeeBannedOrUnbanned(
    userId: number,
    employeeId: number,
    { is_banned }: EmployeeBannedOrUnbanned,
  ) {
    const employee = await this.accountRepository.findByParam({
      id: employeeId,
      role: Role.EMPLOYEE,
    });
    if (userId === employeeId) {
      throw new BadRequestException(HTTPMessages.user.errors.youCanBanYourself);
    }
    if (!employee) {
      throw new NotFoundException(HTTPMessages.user.errors.employeeNotFound);
    }
    const employeeEntity = new UserEntity(employee) as Required<UserEntity>;
    employeeEntity.setBanned(is_banned);
    return this.accountRepository.updateOne(employeeEntity);
  }

  public createContact(userId: number, dto: Required<CreateUserContactDto>) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      const { phone, full_name } = dto;

      let existUser = await this.accountRepository.findByParam({ phone });
      // Agar foydalanuvchi bo'lmasa create qilinadi
      if (!existUser) {
        const userEntity = new UserEntity({
          role: Role.CUSTOMER,
          status: UserStatus.PENDING,
          phone,
        });

        existUser = await this.accountRepository.createOne(userEntity, trx);
      }

      const contactExist = await this.userContactsRepository.findOneByPhone(
        userId,
        existUser.id,
      );

      if (contactExist) {
        throw new BadRequestException(
          HTTPMessages.userContact.errors.youAlreadyAdd,
        );
      }

      const userContactEntity = new UserContactEntity({
        author_id: userId,
        customer_id: existUser.id,
        full_name,
      });

      return this.userContactsRepository.createOne(userContactEntity, trx);
    });
  }

  public getMeContactList(userId: number, dto: GetMeUserContactsDto) {
    return this.userContactsRepository.findAll(userId, dto);
  }

  public globalBannedCustomers(maxBannedCount: number) {
    return this.accountRepository.updateCustomerStatusToBlacklist(
      maxBannedCount,
    );
  }

  public globalUnbannedCustomers(maxBannedCount: number) {
    return this.accountRepository.updateCustomerStatusToWhitelist(
      maxBannedCount,
    );
  }

  public createMultipleContact(
    userId: number,
    contactList: Required<CreateMultipleContactDto[0]>[],
  ) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      if (!contactList.length) return [];

      const phones = contactList.map((item) => item.phone);

      let existUsers =
        await this.accountRepository.findAllCustomerByPhones(phones);

      const nonExistUserPhones = phones.filter(
        (phone) => !existUsers.some((user) => user.phone === phone),
      );
      // Agar yoq foydalanuvchilar bo'lsa,
      // ulani create qilamiza, va pending xolatida turadi
      if (nonExistUserPhones.length) {
        const userEntities = nonExistUserPhones.map(
          (phone) =>
            new UserEntity({
              phone,
              role: Role.CUSTOMER,
              status: UserStatus.PENDING,
            }),
        );

        const newUsers = await this.accountRepository.createMany(
          userEntities,
          trx,
        );

        existUsers = [...existUsers, ...newUsers];
      }
      // Oldingilarini o'chiramiza
      await this.userContactsRepository.deleteManyByAuthorId(userId, trx);

      const userContactEntities = existUsers
        .map((user) => {
          const contactItem = contactList.find(
            (item) => item.phone === user.phone,
          );

          if (!contactItem) return null;

          return new UserContactEntity({
            author_id: userId,
            customer_id: user.id,
            full_name: contactItem.full_name,
          });
        })
        .filter((item) => item);

      return this.userContactsRepository.createMany(userContactEntities, trx);
    });
  }

  public async updateProfile(
    userId: number,
    dto: UpdateProfileAfterVerificationDto,
  ) {
    const hasAccount = await this.accountRepository.findByParam({ id: userId });

    if (!hasAccount) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }

    const userEntity = new UserEntity(hasAccount) as Required<UserEntity>;

    userEntity.updateData(dto);
    return this.accountRepository.updateOne(userEntity);
  }

  public async updateEmployee(employeeId: number, dto: CreateEmployeeDto) {
    return this.transactionsService.useTransaction(async (trx) => {
      const hasAccount = await this.accountRepository.findByParam({
        id: employeeId,
      });

      if (!hasAccount) {
        throw new NotFoundException(HTTPMessages.user.errors.notFound);
      }

      const { password, ...restDto } = dto;

      const userEntity = new UserEntity(hasAccount) as Required<UserEntity>;

      userEntity.updateEmployeeData({
        ...restDto,
      });

      const result = await this.accountRepository.updateOne(userEntity, trx);
      if (password) {
        await this.updatePassword(userEntity.id, password);
      }
      return result;
    });
  }

  public async updateAccountSetting(
    userId: number,
    dto: UpdateAccountSettingsParamDto,
    data: UpdateAccountSettingsDto,
  ) {
    const hasAccount = await this.accountRepository.findByParam({ id: userId });

    if (!hasAccount) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }

    if (!data[dto.type]) {
      throw new UnprocessableEntityException('Data not found');
    }

    return this.accountRepository.updateAccountSettings(userId, data);
  }

  async updatePassword(
    userId: number,
    password: string,
    trx?: Knex.Transaction,
  ) {
    const hasAccount = await this.accountRepository.findForLoginByItem(
      'id',
      userId,
    );
    if (!hasAccount) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }

    if (hasAccount.status === UserStatus.PENDING) {
      throw new ForbiddenException(HTTPMessages.user.errors.pendingAccount);
    }
    const passwordHash: string = await bcrypt.hash(password, 10);

    return this.passwordsRepository.insertAndUpdate(userId, passwordHash, trx);
  }

  async updatePhone(userId: number, { phone }: UpdatePhoneDto) {
    const hasAccount = await this.accountRepository.findByParam({ id: userId });

    if (!hasAccount) {
      throw new NotFoundException(HTTPMessages.user.errors.notFound);
    }
    if (hasAccount.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(HTTPMessages.user.errors.pendingAccount);
    }
    const hasPhone = await this.accountRepository.findByParam({ phone });
    if (hasPhone) {
      throw new BadRequestException(HTTPMessages.user.errors.phoneAlreadyExist);
    }

    const res = await this.authService.createVerifyCode(hasAccount.id, +phone);
    return { ...res, phone };
  }

  async verifyPhone(userId: number, dto: VerifyPhoneDto) {
    return this.transactionsService.useTransaction(async (trx) => {
      const hasVerification =
        await this.verificationRepository.findOneByIdAndStatus(
          dto.id,
          VerificationStatus.PENDING,
        );

      if (!hasVerification) {
        throw new NotFoundException('Verification Not found');
      }

      if (hasVerification.expired_at < new Date(Date.now())) {
        throw new ConflictException('Expired date not finished');
      } else if (!(dto.code === hasVerification.code)) {
        throw new BadRequestException('Wrong code');
      }

      const hasAccount = await this.accountRepository.findByParam({
        id: userId,
      });

      const updateAccountData = new UserEntity(
        hasAccount,
      ) as Required<UserEntity>;

      updateAccountData.updateAccountPhone({ phone: dto.phone });

      await Promise.all([
        this.verificationRepository.updateById(
          { status: VerificationStatus.VERIFIED },
          dto.id,
          trx,
        ),
        this.accountRepository.updateOne(updateAccountData, trx),
      ]);
      return { id: userId };
    });
  }
}
