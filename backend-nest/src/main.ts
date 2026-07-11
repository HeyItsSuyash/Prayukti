import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  ValidationPipe,
  VersioningType,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import type { AppConfig } from './config';

async function bootstrap(): Promise<void> {
  // ─── Create Fastify-backed NestJS Application ───────────────────────────────
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // We use Pino separately
      trustProxy: true,
      connectionTimeout: 10_000,
      maxParamLength: 200,
    }),
    {
      bufferLogs: true, // Buffer logs until logger is attached
    },
  );

  // ─── Attach Pino Logger ───────────────────────────────────────────────────
  const nestLogger = app.get(AppLogger);
  app.useLogger(nestLogger);
  app.flushLogs();

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;
  const reflector = app.get(Reflector);

  const logger = new Logger('Bootstrap');

  // ─── Fastify Plugins ─────────────────────────────────────────────────────

  // Compression (brotli + gzip)
  await app.register(compression, {
    encodings: ['br', 'gzip', 'deflate'],
    threshold: 1024, // Only compress responses > 1KB
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: appConfig.isProduction
      ? undefined
      : false, // Disable CSP in dev for Swagger UI
    crossOriginEmbedderPolicy: false,
  });

  // Cookie parser
  await app.register(fastifyCookie, {
    secret: configService.get<string>('jwt.secret') ?? 'cookie-secret',
  });

  // Multipart (file uploads)
  await app.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max
      files: 10,
    },
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: appConfig.throttleLimit,
    timeWindow: appConfig.throttleTtl * 1000,
    keyGenerator: (request) =>
      (request.headers['x-forwarded-for'] as string) ??
      request.ip ??
      'unknown',
    errorResponseBuilder: () => ({
      success: false,
      statusCode: 429,
      error: 'TooManyRequests',
      message: 'Too many requests, please try again later.',
      timestamp: new Date().toISOString(),
    }),
  });

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: appConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Api-Key',
    ],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400,
  });

  // ─── Global Prefix & Versioning ───────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,         // Auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false, // Collect all errors
    }),
  );

  // ─── Global Filters ───────────────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── Global Interceptors ──────────────────────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
    new TimeoutInterceptor(reflector),
  );

  // ─── Swagger / OpenAPI ────────────────────────────────────────────────────
  if (!appConfig.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Prayukti vLAB API')
      .setDescription(
        'Enterprise backend for Prayukti Virtual Laboratory Platform — NestJS + Fastify + Redis + BullMQ',
      )
      .setVersion('1.0.0')
      .setContact(
        'Prayukti Team',
        'https://prayukti.com',
        'support@prayukti.com',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'JWT',
      )
      .addTag('Health', 'System health endpoints')
      .addTag('Auth', 'Authentication & authorization')
      .addTag('Users', 'User management')
      .addTag('Institutions', 'Institution management')
      .addTag('Subjects', 'Subject management')
      .addTag('Experiments', 'Experiment management')
      .addTag('Labs', 'Virtual lab sessions')
      .addTag('Assessments', 'Assessment & quizzes')
      .addTag('Certificates', 'Certificate generation')
      .addTag('Analytics', 'Analytics & reporting')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
    });

    logger.log(`Swagger UI available at http://localhost:${appConfig.port}/api/docs`);
  }

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  app.enableShutdownHooks();

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — initiating graceful shutdown...');
    await app.close();
    logger.log('Application shut down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received — initiating graceful shutdown...');
    await app.close();
    process.exit(0);
  });

  // ─── Start Server ─────────────────────────────────────────────────────────
  await app.listen(appConfig.port, '0.0.0.0');

  logger.log(
    `🚀 Prayukti vLAB Backend running on http://0.0.0.0:${appConfig.port}/api/v1`,
  );
  logger.log(`Environment: ${appConfig.nodeEnv}`);
}

void bootstrap();
