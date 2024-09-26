import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { AccountsModule } from '@app/accounts';
import { ActivitiesModule } from '@app/activities';

@Module({
  imports: [AccountsModule, ActivitiesModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
