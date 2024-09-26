import { Module } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsGateway } from './ws.gateway';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './services/notification.service';
import { NotificationProcessor } from './processor/notification.processor';
import { NotificationsModule } from '@app/notifications';

@Module({
  imports: [NotificationsModule],
  providers: [
    WsGateway,
    WsService,
    JwtService,
    NotificationService,
    NotificationProcessor,
  ],
  exports: [WsGateway, WsService, JwtService],
})
export class WsModule {}
