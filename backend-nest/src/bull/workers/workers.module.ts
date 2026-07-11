import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../bull.constants';
import type { RedisConfig } from '../../config';

// Workers
import { EmailWorker } from './email.worker';
import { NotificationsWorker } from './notifications.worker';
import { AiWorker } from './ai.worker';
import { VideoWorker } from './video.worker';
import { AnalyticsWorker } from './analytics.worker';
import { CertificateWorker } from './certificate.worker';

const ALL_QUEUE_REGISTRATIONS = Object.values(QUEUE_NAMES).map((name) =>
  BullModule.registerQueueAsync({
    name,
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => {
      const redis = configService.get<RedisConfig>('redis')!;
      return {
        connection: {
          host: redis.host,
          port: redis.port,
          password: redis.password || undefined,
          db: redis.db,
          maxRetriesPerRequest: null,
        },
      };
    },
    inject: [ConfigService],
  }),
);

const ALL_WORKERS = [
  EmailWorker,
  NotificationsWorker,
  AiWorker,
  VideoWorker,
  AnalyticsWorker,
  CertificateWorker,
];

@Module({
  imports: [...ALL_QUEUE_REGISTRATIONS],
  providers: [...ALL_WORKERS],
})
export class WorkersModule {}
