import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../bull.constants';
import type { SendEmailJobData, SendOtpEmailJobData } from '../queues/email.producer';

@Processor(QUEUE_NAMES.EMAIL, {
  concurrency: 5,
})
export class EmailWorker extends WorkerHost {
  private readonly logger = new Logger(EmailWorker.name);

  async process(job: Job): Promise<unknown> {
    this.logger.log(`Processing email job [${job.id}] type: ${job.name}`);

    switch (job.name) {
      case 'send-email':
        return this.handleSendEmail(job as Job<SendEmailJobData>);
      case 'send-otp-email':
        return this.handleSendOtpEmail(job as Job<SendOtpEmailJobData>);
      default:
        this.logger.warn(`Unknown email job type: ${job.name}`);
        return null;
    }
  }

  private async handleSendEmail(job: Job<SendEmailJobData>): Promise<void> {
    const { to, subject, template, context } = job.data;
    await job.updateProgress(10);
    this.logger.debug(`Sending email to ${Array.isArray(to) ? to.join(', ') : to} | subject: ${subject}`);

    // TODO: Inject Nodemailer / Resend / SES transport here
    // Example: await this.mailService.send({ to, subject, template, context });

    await job.updateProgress(100);
    this.logger.log(`Email sent successfully [jobId: ${job.id}]`);
  }

  private async handleSendOtpEmail(
    job: Job<SendOtpEmailJobData>,
  ): Promise<void> {
    const { to, otp, userName, expiresInMinutes } = job.data;
    await job.updateProgress(10);
    this.logger.debug(`Sending OTP email to ${to}`);

    // TODO: Inject Nodemailer / Resend / SES transport here
    // Example: await this.mailService.sendOtp({ to, otp, userName, expiresInMinutes });

    await job.updateProgress(100);
    this.logger.log(`OTP email sent [jobId: ${job.id}] to ${to}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Email job completed [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Email job failed [${job.id}] attempt ${job.attemptsMade}/${job.opts.attempts}: ${error.message}`,
    );
    if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
      this.logger.error(`Email job [${job.id}] moved to DLQ after all retries exhausted`);
    }
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number | object): void {
    this.logger.debug(`Email job [${job.id}] progress: ${JSON.stringify(progress)}`);
  }
}
