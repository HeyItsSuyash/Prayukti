import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../bull.constants';

export interface VideoJobData {
  type: 'transcode' | 'thumbnail' | 'upload' | 'delete';
  experimentId: string;
  userId: string;
  sourceUrl?: string;
  targetFormat?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class VideoProducer {
  private readonly logger = new Logger(VideoProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.VIDEO) private readonly videoQueue: Queue,
  ) {}

  async enqueue(data: VideoJobData, options?: JobsOptions): Promise<string> {
    const job = await this.videoQueue.add(data.type, data, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });
    this.logger.debug(
      `Video job queued → type: ${data.type}, experimentId: ${data.experimentId}`,
    );
    return job.id ?? '';
  }
}
