import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../bull.constants';

export interface CertificateJobData {
  type: 'generate' | 'email' | 'revoke';
  userId: string;
  courseId?: string;
  experimentId?: string;
  completionDate: string;
  recipientName: string;
  recipientEmail: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class CertificateProducer {
  private readonly logger = new Logger(CertificateProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.CERTIFICATE)
    private readonly certificateQueue: Queue,
  ) {}

  async generate(
    data: CertificateJobData,
    options?: JobsOptions,
  ): Promise<string> {
    const job = await this.certificateQueue.add(data.type, data, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });
    this.logger.debug(
      `Certificate job queued → type: ${data.type}, userId: ${data.userId}`,
    );
    return job.id ?? '';
  }
}
