import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../bull.constants';

export interface NotificationJobData {
  userId: string;
  type: 'push' | 'in-app' | 'sms';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
}

@Injectable()
export class NotificationsProducer {
  private readonly logger = new Logger(NotificationsProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
  ) {}

  async send(
    data: NotificationJobData,
    options?: JobsOptions,
  ): Promise<void> {
    await this.notificationsQueue.add('send-notification', data, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });
    this.logger.debug(
      `Notification job queued → userId: ${data.userId}, type: ${data.type}`,
    );
  }

  async sendBulk(
    notifications: NotificationJobData[],
    options?: JobsOptions,
  ): Promise<void> {
    const jobs = notifications.map((data) => ({
      name: 'send-notification',
      data,
      opts: { ...DEFAULT_JOB_OPTIONS, ...options },
    }));
    await this.notificationsQueue.addBulk(jobs);
    this.logger.debug(`Bulk notification jobs queued: ${jobs.length} jobs`);
  }
}
