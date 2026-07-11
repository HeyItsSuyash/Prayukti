import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../bull.constants';

export type AnalyticsEventType =
  | 'experiment-view'
  | 'experiment-complete'
  | 'lab-session-start'
  | 'lab-session-end'
  | 'quiz-attempt'
  | 'page-view'
  | 'login'
  | 'logout';

export interface AnalyticsJobData {
  event: AnalyticsEventType;
  userId: string;
  institutionId?: string;
  sessionId?: string;
  resourceId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class AnalyticsProducer {
  private readonly logger = new Logger(AnalyticsProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.ANALYTICS) private readonly analyticsQueue: Queue,
  ) {}

  async track(data: AnalyticsJobData, options?: JobsOptions): Promise<void> {
    await this.analyticsQueue.add(data.event, data, {
      ...DEFAULT_JOB_OPTIONS,
      removeOnComplete: true, // Analytics don't need to be kept
      ...options,
    });
    this.logger.debug(
      `Analytics event queued → event: ${data.event}, userId: ${data.userId}`,
    );
  }

  async trackBulk(
    events: AnalyticsJobData[],
    options?: JobsOptions,
  ): Promise<void> {
    const jobs = events.map((data) => ({
      name: data.event,
      data,
      opts: {
        ...DEFAULT_JOB_OPTIONS,
        removeOnComplete: true as const,
        ...options,
      },
    }));
    await this.analyticsQueue.addBulk(jobs);
    this.logger.debug(`Bulk analytics events queued: ${jobs.length}`);
  }
}
