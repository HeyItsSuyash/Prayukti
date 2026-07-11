import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../bull.constants';

export interface SendEmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
  from?: string;
  replyTo?: string;
}

export interface SendOtpEmailJobData {
  to: string;
  otp: string;
  userName: string;
  expiresInMinutes: number;
}

@Injectable()
export class EmailProducer {
  private readonly logger = new Logger(EmailProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
  ) {}

  async sendEmail(
    data: SendEmailJobData,
    options?: JobsOptions,
  ): Promise<void> {
    await this.emailQueue.add('send-email', data, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });
    this.logger.debug(`Email job queued → ${Array.isArray(data.to) ? data.to.join(', ') : data.to}`);
  }

  async sendOtpEmail(
    data: SendOtpEmailJobData,
    options?: JobsOptions,
  ): Promise<void> {
    await this.emailQueue.add('send-otp-email', data, {
      ...DEFAULT_JOB_OPTIONS,
      priority: 1, // High priority for OTP
      ...options,
    });
    this.logger.debug(`OTP email job queued → ${data.to}`);
  }

  async getQueueStats(): Promise<Record<string, number>> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }
}
