import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WsGateway } from '../ws.gateway';
import { subscribers } from '../ws.constants';
import { UserNotificationRepository } from '@app/notifications/repository/user-notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: UserNotificationRepository,
  ) {}

  async sendNotification(job: Job) {
    try {
      const ws_obj = WsGateway.getObject();
      const rooms = ws_obj.getRooms();
      const notificationResult =
        await this.notificationRepository.findOneWebsocket(job.data.result.id);
      const findAccount = rooms.filter((val) => {
        return job.data.receiver_ids.includes(val.account_id);
      });
      if (findAccount.length > 0) {
        for (const account of findAccount) {
          ws_obj.broadcastToClient(
            account.socket_id,
            subscribers.NOTIFICATIONS,
            notificationResult,
          );
        }
      }
    } catch (error: any) {
      return this.logger.log({ error: error.message });
    }
  }
}
