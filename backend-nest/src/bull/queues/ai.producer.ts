import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../bull.constants';

export interface AiJobData {
  type: 'code-analysis' | 'complexity-analysis' | 'ai-feedback' | 'ai-chat';
  userId: string;
  sessionId?: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class AiProducer {
  private readonly logger = new Logger(AiProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.AI) private readonly aiQueue: Queue,
  ) {}

  async enqueue(data: AiJobData, options?: JobsOptions): Promise<string> {
    const job = await this.aiQueue.add(data.type, data, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });
    this.logger.debug(`AI job queued → type: ${data.type}, jobId: ${job.id}`);
    return job.id ?? '';
  }

  async getJobStatus(jobId: string): Promise<string | undefined> {
    const job = await this.aiQueue.getJob(jobId);
    return job?.getState();
  }
}
