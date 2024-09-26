import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { AccountsRepository } from './repository/accounts.repository';
import { BannedUsersRepository } from './repository/banned_users.repository';
import { BannedUsersService } from './services/banned_users.service';
import { AccountsCronService } from './accounts.cron.service';
import { UserContactsRepository } from './repository/user-contacts.repository';
import { SmsService, TransactionsService } from '@app/shared';
import { PasswordsRepository } from './repository/password.repository';
import { SettingsModule } from '@app/settings';
import { AuthModule } from '@app/auth';

@Module({
  imports: [SettingsModule, AuthModule],
  controllers: [AccountController],
  providers: [
    AccountsService,
    AccountsRepository,
    BannedUsersRepository,
    BannedUsersService,
    AccountsCronService,
    UserContactsRepository,
    TransactionsService,
    SmsService,
    PasswordsRepository,
  ],
  exports: [
    AccountsService,
    AccountsRepository,
    BannedUsersRepository,
    BannedUsersService,
    UserContactsRepository,
    SmsService,
  ],
})
export class AccountsModule {}
