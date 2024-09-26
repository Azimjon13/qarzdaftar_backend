import {
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  LoginRegisterDto,
  LoginWebDto,
  ResendVerificationCode,
  TelegramAuthCallbackDto,
  TelegramAuthDto,
  VerificationDto,
} from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountsRepository } from '@app/accounts/repository/accounts.repository';
import { VerificationsRepository } from './repositories/verification.repository';
import { SmsService } from '@app/shared';
import { ThrottlerException } from '@nestjs/throttler';
import { randomInt } from 'crypto';
import { VerificationStatus } from 'database/migrations/20240409005232_verifications';
import { UserStatus, Role } from 'database/migrations/20240409001219_users';
import { UpdateProfileAfterVerificationDto } from '@app/accounts/dto/create-account.dto';
import * as bcrypt from 'bcrypt';
import { HTTPMessages } from '@app/shared/constants/http-messages';
import { UserEntity } from '@app/accounts/entities/user.entity';
import { TransactionsService as KnexTransactionsService } from '@app/shared/services/transactions.service';

@Injectable()
export class AuthService {
  private isProd = new RegExp('true').test(
    this.configService.get('IS_PRODUCTION') as any,
  );

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly accountsRepository: AccountsRepository,
    private readonly verificationsRepository: VerificationsRepository,
    private readonly smsService: SmsService,
    private readonly knexTransactionsServcie: KnexTransactionsService,
  ) {}

  async registerMobile(payload: LoginRegisterDto) {
    const hasAccount = await this.accountsRepository.findByParam({
      phone: payload.phone,
    });

    if (hasAccount) {
      return this.createVerifyCode(hasAccount.id, +hasAccount.phone);
    }

    const newAccount = await this.accountsRepository.createAccount(
      payload,
      Role.CUSTOMER,
    );

    return this.createVerifyCode(newAccount.id, +newAccount.phone);
  }

  public async tgSaveCallbackData(dto: TelegramAuthCallbackDto) {
    const { id, first_name, last_name, ...restDto } = dto;

    let user = await this.accountsRepository.findByParam({
      telegram_id: id,
    });

    if (!user) {
      const userEntity = new UserEntity({
        phone: '',
        first_name,
        last_name,
        role: Role.CUSTOMER,
        status: UserStatus.PENDING,
        telegram_id: id,
        meta: {
          notifications: {},
          language: 'en',
          theme: 'light',
          tg_auth_data: restDto,
        },
      });

      user = await this.accountsRepository.createOne(userEntity);
    }

    return { telegram_user_id: user.telegram_id, user_phone: user.phone };
  }

  public async telegramAuthConfirm(dto: TelegramAuthDto) {
    return this.knexTransactionsServcie.useTransaction(async (trx) => {
      const { tg_user_id, phone } = dto;
      const userTelegram = await this.accountsRepository.findByParam({
        telegram_id: tg_user_id,
      });

      if (!userTelegram) {
        throw new NotFoundException(
          HTTPMessages.user.errors.notFoundAuthTelegram,
        );
      }

      let userId: number = userTelegram.id;

      if (!userTelegram.is_tg_login) {
        const {
          telegram_id,
          meta: { tg_auth_data },
        } = userTelegram;

        const user = await this.accountsRepository.findByParam({
          phone,
          status: UserStatus.ACTIVE,
        });

        if (user) {
          userId = user.id;
          const userEntity = new UserEntity(user) as Required<UserEntity>;

          userEntity
            .updateMeta({ tg_auth_data })
            .updateData({ telegram_id, is_tg_login: true });

          await Promise.all([
            this.accountsRepository.updateOne(userEntity, trx),
            this.accountsRepository.hardDeleteOneByParams(
              {
                id: userTelegram.id,
              },
              trx,
            ),
          ]);
        } else {
          const userEntity = new UserEntity(
            userTelegram,
          ) as Required<UserEntity>;

          userEntity
            .updateAccountPhone({ phone })
            .updateData({ is_tg_login: true, status: UserStatus.ACTIVE });

          await this.accountsRepository.updateOne(userEntity, trx);
        }
      } else if (userTelegram.phone !== phone) {
        throw new NotFoundException(
          HTTPMessages.user.errors.notFoundAuthTelegram,
        );
      }

      return this.generateResponseWeb(userId, false);
    });
  }

  async login(payload: LoginWebDto) {
    const hasAccount = await this.accountsRepository.findForLoginByItem(
      'phone',
      payload.phone,
    );

    if (!hasAccount)
      throw new UnauthorizedException(HTTPMessages.user.errors.notFound);

    if (hasAccount.is_banned) {
      throw new BadRequestException(HTTPMessages.user.errors.youAreBanned);
    }

    const matchPassword = await bcrypt.compare(
      payload.password,
      hasAccount.password,
    );
    if (!matchPassword) {
      throw new UnauthorizedException('Wrong login or password');
    }
    if (hasAccount.status === UserStatus.ACTIVE) {
      return this.generateResponseWeb(hasAccount.id, false);
    } else if (hasAccount.status === UserStatus.PENDING) {
      return this.createVerifyCode(hasAccount.id, +hasAccount.phone);
    } else {
      throw new UnauthorizedException(HTTPMessages.user.errors.notFound);
    }
  }

  async updateProfileAfterVerification(
    account_id: number,
    data: UpdateProfileAfterVerificationDto,
  ) {
    const hasAccount = await this.accountsRepository.findByParam({
      id: account_id,
    });

    if (!hasAccount) {
      throw new NotFoundException('This user is not found');
    }

    const res = await this.accountsRepository.updateAccountByParam(
      { id: account_id },
      data,
    );

    return { id: res.id };
  }

  validateDevices(headers: any) {
    if (
      headers['x-device-build-id'] &&
      headers['x-device-os-version'] &&
      headers['x-device-os'] &&
      headers['x-device-version'] &&
      headers['x-device-type'] &&
      headers['x-device-cpu-arch'] &&
      headers['x-device-name'] &&
      headers['x-user-type'] &&
      (headers['x-user-type'] === 'customer' ||
        headers['x-user-type'] === 'driver')
    ) {
      return {
        device_type: headers['x-device-type'],
        device_name: headers['x-device-name'],
        meta: {
          os: headers['x-device-os'],
          os_version: headers['x-device-version'],
          version: headers['x-device-version'],
          cpu_arch: headers['x-device-cpu-arch'],
          build_id: headers['x-device-build-id'],
        },
      };
    } else {
      throw new UnauthorizedException('Invalid credentials device');
    }
  }

  async verifyMobile(payload: VerificationDto) {
    const hasVerificationCode =
      await this.verificationsRepository.findOneByIdAndStatus(
        payload.id,
        VerificationStatus.PENDING,
      );

    if (!hasVerificationCode) {
      throw new NotFoundException('Verification not found');
    }
    const currentTime = new Date(Date.now());
    if (hasVerificationCode.expired_at < currentTime) {
      await this.verificationsRepository.updateById(
        { status: VerificationStatus.CANCELED },
        payload.id,
      );
      throw new GoneException('Time Expired');
    } else if (!(payload.code === hasVerificationCode.code)) {
      throw new UnauthorizedException('Wrong code');
    }
    const res: any =
      await this.verificationsRepository.updateStatusWithAccountTr(payload.id);

    return this.generateResponseWeb(res.user.id, false);
  }

  verifications() {
    return this.verificationsRepository.findAll();
  }

  async resendVerificationCode(payload: ResendVerificationCode) {
    const hasVerification =
      await this.verificationsRepository.findOneByIdAndStatus(
        payload.id,
        VerificationStatus.PENDING,
      );
    if (!hasVerification) {
      throw new NotFoundException('Verification Not found');
    }
    if (hasVerification.expired_at > new Date(Date.now())) {
      throw new ConflictException('Expired date not finished');
    }
    return this.createVerifyCode(
      hasVerification.user_id,
      hasVerification.phone,
    );
  }

  protected tokenGenerator(payload: any, expiresIn: string) {
    const options = {
      secret:
        this.configService.get('JWT_SECRET') ||
        '279e6748cb67c36691c8bed072239880',
      expiresIn: expiresIn || '1w',
    };
    return this.jwtService.sign(payload, options);
  }

  public async createVerifyCode(account_id: number, phone: number) {
    const code = randomInt(1000, 9999);
    const currentTime = new Date(Date.now());
    const expired_at = new Date(
      currentTime.setTime(currentTime.getTime() + 1000 * 60),
    );
    const checkLimit =
      await this.verificationsRepository.findLastOneDayVerificationsByAccountId(
        account_id,
      );
    const smsLimitString = this.configService.get('SMS_LIMIT');
    const smsLimit =
      smsLimitString !== undefined
        ? parseInt(this.configService.get('SMS_LIMIT') as string)
        : 10;
    if (checkLimit.length >= smsLimit) {
      throw new ThrottlerException('Your sms limit is full');
    }

    const verifyData = {
      user_id: account_id,
      status: VerificationStatus.PENDING,
      code,
      expired_at,
    };
    const [, [data]] =
      await this.verificationsRepository.updateAndInsertVerificationWithTr(
        verifyData,
      );

    if (this.isProd) {
      await this.smsService.send({
        phone: phone,
        code: data.code,
      });
      return {
        id: data.id,
      };
    } else {
      return {
        id: data.id,
        code: data.code,
      };
    }
  }

  private async generateResponseWeb(user_id: number, rememberMe: boolean) {
    const { first_name, last_name, id, role, phone, avatar } =
      await this.accountsRepository.accountPayload(user_id);

    const access_token = this.tokenGenerator(
      {
        sub: id,
        issuer: 'front-app-url',
        user: {
          id: id,
          full_name: first_name + last_name,
          role: role,
          first_name,
          last_name,
          phone,
          avatar,
        },
      },
      this.configService.get('JWT_EXPIRES_IN') || '1h',
    );

    if (rememberMe) {
      const refresh_token = this.tokenGenerator(
        {
          sub: id,
          issuer: 'front-app-url',
        },
        this.configService.get('JWT_REFRESH_EXPIRES_IN') || '1w',
      );
      return {
        user: {
          id: id,
          full_name: first_name + last_name,
          role: role,
          first_name,
          last_name,
          phone,
          avatar,
        },
        access_token,
        refresh_token,
      };
    } else {
      return {
        user: {
          id: id,
          full_name: first_name + ' ' + last_name,
          role: role,
          first_name,
          last_name,
          phone,
          avatar,
        },
        access_token,
      };
    }
  }
}
