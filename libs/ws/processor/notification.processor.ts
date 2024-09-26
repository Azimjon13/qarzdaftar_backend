import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationService } from '../services/notification.service';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process('send-user-notification')
  applyLoadCarrier(job: Job) {
    try {
      return this.notificationService.sendNotification(job);
    } catch (error) {
      return this.logger.log({ error, job });
    }
  }
}
