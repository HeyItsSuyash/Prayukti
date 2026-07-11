import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  emailConfig,
  validationSchema,
} from './config';

import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { BullQueueModule } from './bull/bull.module';
import { WorkersModule } from './bull/workers/workers.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ─── Core Config (loaded first) ──────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, emailConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      expandVariables: true,
    }),

    // ─── Infrastructure Modules ──────────────────────────────────────────────
    LoggerModule,
    DatabaseModule,
    RedisModule,

    // ─── Queue Infrastructure ────────────────────────────────────────────────
    BullQueueModule,
    WorkersModule,

    // ─── Feature Modules ─────────────────────────────────────────────────────
    HealthModule,

    // TODO: Add domain modules here as they are built
    // AuthModule,
    // UsersModule,
    // SubjectsModule,
    // ExperimentsModule,
    // InstitutionsModule,
    // LabsModule,
    // AssessmentsModule,
    // CertificatesModule,
    // AnalyticsModule,
  ],
})
export class AppModule {}
