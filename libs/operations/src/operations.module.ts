import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { OperationsRepository } from './repositories/operations.repository';
import { TransactionsService } from '@app/shared';
import { TransactionsRepository } from './repositories/transactions.repository';
import { AccountsModule } from '@app/accounts';
import { NotificationsModule } from '@app/notifications';
import { SettingsModule } from '@app/settings';

@Module({
  imports: [AccountsModule, NotificationsModule, SettingsModule],
  controllers: [OperationsController],
  providers: [
    OperationsService,
    OperationsRepository,
    TransactionsRepository,
    TransactionsService,
  ],
  exports: [OperationsService, OperationsRepository],
})
export class OperationsModule {}
