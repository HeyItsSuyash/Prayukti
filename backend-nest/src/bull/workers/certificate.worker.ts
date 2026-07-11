import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../bull.constants';
import type { CertificateJobData } from '../queues/certificate.producer';

@Processor(QUEUE_NAMES.CERTIFICATE, { concurrency: 5 })
export class CertificateWorker extends WorkerHost {
  private readonly logger = new Logger(CertificateWorker.name);

  async process(job: Job<CertificateJobData>): Promise<unknown> {
    this.logger.log(
      `Processing certificate job [${job.id}] type: ${job.data.type} for userId: ${job.data.userId}`,
    );
    await job.updateProgress(10);

    switch (job.data.type) {
      case 'generate':
        return this.handleGenerate(job);
      case 'email':
        return this.handleEmail(job);
      case 'revoke':
        return this.handleRevoke(job);
      default:
        return null;
    }
  }

  private async handleGenerate(job: Job<CertificateJobData>): Promise<unknown> {
    await job.updateProgress(30);
    // TODO: Use PDFKit / Puppeteer to generate certificate PDF
    this.logger.debug(`Generating certificate for ${job.data.recipientName}`);
    await job.updateProgress(100);
    return { certificateUrl: 'https://cdn.prayukti.com/certificates/generated.pdf' };
  }

  private async handleEmail(job: Job<CertificateJobData>): Promise<unknown> {
    await job.updateProgress(50);
    // TODO: Email the generated certificate PDF
    this.logger.debug(`Emailing certificate to ${job.data.recipientEmail}`);
    await job.updateProgress(100);
    return { emailed: true };
  }

  private async handleRevoke(job: Job<CertificateJobData>): Promise<unknown> {
    await job.updateProgress(50);
    // TODO: Mark certificate as revoked in database
    this.logger.debug(`Revoking certificate for userId: ${job.data.userId}`);
    await job.updateProgress(100);
    return { revoked: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Certificate job completed [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Certificate job failed [${job.id}] attempt ${job.attemptsMade}: ${error.message}`,
    );
  }
}
