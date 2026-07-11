import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../bull.constants';
import type { VideoJobData } from '../queues/video.producer';

@Processor(QUEUE_NAMES.VIDEO, { concurrency: 2 })
export class VideoWorker extends WorkerHost {
  private readonly logger = new Logger(VideoWorker.name);

  async process(job: Job<VideoJobData>): Promise<unknown> {
    this.logger.log(
      `Processing video job [${job.id}] type: ${job.data.type}, experimentId: ${job.data.experimentId}`,
    );
    await job.updateProgress(5);

    switch (job.data.type) {
      case 'transcode':
        return this.handleTranscode(job);
      case 'thumbnail':
        return this.handleThumbnail(job);
      case 'upload':
        return this.handleUpload(job);
      case 'delete':
        return this.handleDelete(job);
      default:
        return null;
    }
  }

  private async handleTranscode(job: Job<VideoJobData>): Promise<unknown> {
    await job.updateProgress(20);
    // TODO: Integrate FFmpeg / cloud transcoding service
    this.logger.debug(`Transcoding video for experimentId: ${job.data.experimentId}`);
    await job.updateProgress(100);
    return { transcoded: true };
  }

  private async handleThumbnail(job: Job<VideoJobData>): Promise<unknown> {
    await job.updateProgress(50);
    // TODO: Extract thumbnail at specific timestamp
    this.logger.debug(`Generating thumbnail for experimentId: ${job.data.experimentId}`);
    await job.updateProgress(100);
    return { thumbnailUrl: 'https://cdn.prayukti.com/thumbnails/placeholder.jpg' };
  }

  private async handleUpload(job: Job<VideoJobData>): Promise<unknown> {
    await job.updateProgress(50);
    // TODO: Upload to S3 / GCS / Azure Blob
    this.logger.debug(`Uploading video for experimentId: ${job.data.experimentId}`);
    await job.updateProgress(100);
    return { uploaded: true };
  }

  private async handleDelete(job: Job<VideoJobData>): Promise<unknown> {
    await job.updateProgress(50);
    // TODO: Delete from cloud storage
    this.logger.debug(`Deleting video for experimentId: ${job.data.experimentId}`);
    await job.updateProgress(100);
    return { deleted: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Video job completed [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Video job failed [${job.id}]: ${error.message}`);
  }
}
