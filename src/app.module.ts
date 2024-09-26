import { Module } from '@nestjs/common';
import { SharedModule } from '@app/shared';
import { AccountsModule } from '@app/accounts';
import { AuthModule } from '@app/auth';
import { OperationsModule } from '@app/operations';
import { NotificationsModule } from '@app/notifications';
import { ActivitiesModule } from '@app/activities';
import { MediasModule } from '@app/medias';
import { TranslationsModule } from '@app/translations';
import { TranslationKeysModule } from '@app/translation-keys';
import { SettingsModule } from '@app/settings';
import { ExportModule } from 'libs/export/export.module';
import { WsModule } from '../libs/ws/ws.module';
import { ErrorLogsModule } from '@app/error-logs';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    AccountsModule,
    OperationsModule,
    NotificationsModule,
    ActivitiesModule,
    MediasModule,
    TranslationsModule,
    TranslationKeysModule,
    ExportModule,
    SettingsModule,
    ErrorLogsModule,
    WsModule,
  ],
})
export class AppModule {}
