import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BannedUsersService } from './services/banned_users.service';
import { AccountsService } from './accounts.service';
import { SettingsService } from '@app/settings';

@Injectable()
export class AccountsCronService {
  constructor(
    private readonly bannedUsersService: BannedUsersService,
    private readonly accountsService: AccountsService,
    private readonly settingsService: SettingsService,
  ) {}

  @Cron('0 58 11,23 * * *')
  public deadlineOperationExpired() {
    return this.bannedUsersService.bannedUsersByOperationExpired();
  }

  @Cron('0 59 11,23 * * *')
  public async globalBannedCustomers() {
    const settings = await this.settingsService.getSetting();
    return this.accountsService.globalBannedCustomers(
      settings.global_blacklist_count,
    );
  }

  @Cron('0 0 12,0 * * *')
  public async globalUnbannedCustomers() {
    const settings = await this.settingsService.getSetting();
    return this.accountsService.globalUnbannedCustomers(
      settings.global_blacklist_count,
    );
  }
}
