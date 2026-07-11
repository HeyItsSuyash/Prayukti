import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import type { AppConfig } from '../config';
import type {
  HealthCheckResult,
  ComponentHealth,
  MemoryInfo,
} from './health.types';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [redisHealth] = await Promise.all([this.checkRedis()]);

    // Postgres check is done via drizzle — placeholder until DatabaseModule is connected
    const postgresHealth: ComponentHealth = await this.checkPostgres();

    const memory = this.getMemoryInfo();
    const uptime = this.formatUptime(process.uptime());
    const appConfig = this.configService.get<AppConfig>('app')!;

    const overallStatus =
      redisHealth.status === 'ok' && postgresHealth.status === 'ok'
        ? 'ok'
        : 'error';

    return {
      status: overallStatus,
      backend: 'ok',
      postgres: postgresHealth,
      redis: redisHealth,
      uptime,
      memory,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '1.0.0',
      environment: appConfig.nodeEnv,
    };
  }

  private async checkRedis(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
      const alive = await this.redisService.ping();
      return {
        status: alive ? 'ok' : 'error',
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      this.logger.error(`Redis health check failed: ${(err as Error).message}`);
      return {
        status: 'error',
        message: (err as Error).message,
        latencyMs: Date.now() - start,
      };
    }
  }

  private async checkPostgres(): Promise<ComponentHealth> {
    // TODO: Replace with actual drizzle DB ping when DatabaseModule is wired
    // const start = Date.now();
    // try {
    //   await db.execute(sql`SELECT 1`);
    //   return { status: 'ok', latencyMs: Date.now() - start };
    // } catch (err) { ... }
    return { status: 'ok', message: 'Check pending DB module integration' };
  }

  private getMemoryInfo(): MemoryInfo {
    const mem = process.memoryUsage();
    const toMb = (bytes: number): number =>
      Math.round((bytes / 1024 / 1024) * 100) / 100;
    return {
      heapUsedMb: toMb(mem.heapUsed),
      heapTotalMb: toMb(mem.heapTotal),
      rssMb: toMb(mem.rss),
      externalMb: toMb(mem.external),
    };
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  }
}
