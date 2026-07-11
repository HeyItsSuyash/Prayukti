import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../bull.constants';
import type { AiJobData } from '../queues/ai.producer';

@Processor(QUEUE_NAMES.AI, { concurrency: 3 })
export class AiWorker extends WorkerHost {
  private readonly logger = new Logger(AiWorker.name);

  async process(job: Job<AiJobData>): Promise<unknown> {
    this.logger.log(
      `Processing AI job [${job.id}] type: ${job.data.type} for userId: ${job.data.userId}`,
    );
    await job.updateProgress(5);

    switch (job.data.type) {
      case 'code-analysis':
        return this.handleCodeAnalysis(job);
      case 'complexity-analysis':
        return this.handleComplexityAnalysis(job);
      case 'ai-feedback':
        return this.handleAiFeedback(job);
      case 'ai-chat':
        return this.handleAiChat(job);
      default:
        this.logger.warn(`Unknown AI job type: ${job.data.type}`);
        return null;
    }
  }

  private async handleCodeAnalysis(job: Job<AiJobData>): Promise<unknown> {
    await job.updateProgress(30);
    // TODO: Call AI service (OpenAI / Gemini / custom model)
    this.logger.debug(`Code analysis for userId: ${job.data.userId}`);
    await job.updateProgress(100);
    return { analysisComplete: true };
  }

  private async handleComplexityAnalysis(job: Job<AiJobData>): Promise<unknown> {
    await job.updateProgress(30);
    // TODO: Analyze time/space complexity
    this.logger.debug(`Complexity analysis for userId: ${job.data.userId}`);
    await job.updateProgress(100);
    return { complexity: { time: 'O(n)', space: 'O(1)' } };
  }

  private async handleAiFeedback(job: Job<AiJobData>): Promise<unknown> {
    await job.updateProgress(30);
    // TODO: Generate AI feedback on experiment submission
    this.logger.debug(`AI feedback for userId: ${job.data.userId}`);
    await job.updateProgress(100);
    return { feedbackGenerated: true };
  }

  private async handleAiChat(job: Job<AiJobData>): Promise<unknown> {
    await job.updateProgress(30);
    // TODO: Process AI chat message
    this.logger.debug(`AI chat for sessionId: ${job.data.sessionId}`);
    await job.updateProgress(100);
    return { responded: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`AI job completed [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`AI job failed [${job.id}] attempt ${job.attemptsMade}: ${error.message}`);
  }
}
