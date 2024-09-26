import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SmsService } from '@app/shared';

@Processor('sms')
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);
  private senderJobId = 0;

  constructor(private readonly smsService: SmsService) {}

  @Process('sms-verification')
  handlePhoneVerification(job: Job) {
    return this.runJob(job);
  }

  protected async runJob(job: Job) {
    this.senderJobId++;
    try {
      if (this.senderJobId == 1) {
        const res = await this.smsService.send({
          phone: job.data.phone,
          code: job.data.code,
        });
        return this.logger.log({
          action: '---',
          message: '--all-done--',
          data: res,
        });
      } else {
        return this.logger.log({
          action: '---',
          message: '--fix duplicate-',
        });
      }
    } catch (err) {
      return this.logger.error({ error: err, job });
    } finally {
      this.senderJobId = 0;
    }
  }
}
