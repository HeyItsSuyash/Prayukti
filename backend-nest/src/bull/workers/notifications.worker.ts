import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../bull.constants';
import type { NotificationJobData } from '../queues/notifications.producer';

@Processor(QUEUE_NAMES.NOTIFICATIONS, { concurrency: 10 })
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);

  async process(job: Job<NotificationJobData>): Promise<unknown> {
    this.logger.log(
      `Processing notification job [${job.id}] type: ${job.data.type} for userId: ${job.data.userId}`,
    );
    await job.updateProgress(10);

    switch (job.data.type) {
      case 'push':
        await this.handlePush(job);
        break;
      case 'in-app':
        await this.handleInApp(job);
        break;
      case 'sms':
        await this.handleSms(job);
        break;
    }

    await job.updateProgress(100);
    return { sent: true };
  }

  private async handlePush(job: Job<NotificationJobData>): Promise<void> {
    // TODO: Integrate FCM / APNs / OneSignal
    this.logger.debug(
      `Push notification → userId: ${job.data.userId}, title: ${job.data.title}`,
    );
  }

  private async handleInApp(job: Job<NotificationJobData>): Promise<void> {
    // TODO: Persist to notifications table + emit via WebSocket
    this.logger.debug(
      `In-app notification → userId: ${job.data.userId}`,
    );
  }

  private async handleSms(job: Job<NotificationJobData>): Promise<void> {
    // TODO: Integrate Twilio / MSG91
    this.logger.debug(
      `SMS notification → userId: ${job.data.userId}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Notification job completed [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Notification job failed [${job.id}]: ${error.message}`,
    );
  }
}
