import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../bull.constants';
import type { AnalyticsJobData } from '../queues/analytics.producer';

@Processor(QUEUE_NAMES.ANALYTICS, { concurrency: 20 })
export class AnalyticsWorker extends WorkerHost {
  private readonly logger = new Logger(AnalyticsWorker.name);

  async process(job: Job<AnalyticsJobData>): Promise<unknown> {
    this.logger.debug(
      `Processing analytics event [${job.id}]: ${job.data.event} for userId: ${job.data.userId}`,
    );

    // TODO: Write analytics event to TimescaleDB / ClickHouse / BigQuery
    // await this.analyticsRepository.insert(job.data);

    return { tracked: true, event: job.data.event };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Analytics job failed [${job.id}]: ${error.message}`);
  }
}
