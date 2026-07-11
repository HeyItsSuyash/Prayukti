import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import {
  Global,
  Module,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import type { RedisConfig } from '../config';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from './bull.constants';

// Producers
import { EmailProducer } from './queues/email.producer';
import { NotificationsProducer } from './queues/notifications.producer';
import { AiProducer } from './queues/ai.producer';
import { VideoProducer } from './queues/video.producer';
import { AnalyticsProducer } from './queues/analytics.producer';
import { CertificateProducer } from './queues/certificate.producer';

const ALL_QUEUES = Object.values(QUEUE_NAMES).map((name) =>
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
        },
        defaultJobOptions: { ...DEFAULT_JOB_OPTIONS },
      };
    },
    inject: [ConfigService],
  }),
);

const PRODUCERS = [
  EmailProducer,
  NotificationsProducer,
  AiProducer,
  VideoProducer,
  AnalyticsProducer,
  CertificateProducer,
];

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
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
    ...ALL_QUEUES,
  ],
  providers: [...PRODUCERS],
  exports: [BullModule, ...PRODUCERS],
})
export class BullQueueModule {}
