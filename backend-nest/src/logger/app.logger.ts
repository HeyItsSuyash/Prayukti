import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { Logger as PinoLogger } from 'pino';
import type { AppConfig } from '../config';

@Injectable()
export class AppLogger implements NestLoggerService {
  private readonly logger: PinoLogger;

  constructor(private readonly configService: ConfigService) {
    const appConfig = this.configService.get<AppConfig>('app');
    const isDev = appConfig?.isDevelopment ?? true;
    const level = appConfig?.logLevel ?? 'info';

    this.logger = pino({
      level,
      ...(isDev
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
                singleLine: false,
              },
            },
          }
        : {
            // JSON in production — structured, parseable by log aggregators
            formatters: {
              level: (label: string) => ({ level: label }),
            },
            timestamp: pino.stdTimeFunctions.isoTime,
          }),
    });
  }

  log(message: string, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ context }, message);
  }

  fatal(message: string, context?: string): void {
    this.logger.fatal({ context }, message);
  }

  /**
   * Create a child logger with bound context fields.
   */
  child(bindings: Record<string, unknown>): PinoLogger {
    return this.logger.child(bindings);
  }
}
