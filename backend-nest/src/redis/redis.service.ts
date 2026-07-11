import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import {
  REDIS_LOCK_TTL_MS,
  REDIS_NAMESPACES,
} from './redis.constants';
import type { RedisConfig } from '../config';

export interface SetOptions {
  /** TTL in seconds */
  ttl?: number;
  /** Only set if key does not exist */
  nx?: boolean;
}

export interface LockResult {
  acquired: boolean;
  lockKey: string;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: IORedis;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<RedisConfig>('redis')!;

    this.client = new IORedis({
      host: config.host,
      port: config.port,
      password: config.password || undefined,
      db: config.db,
      keyPrefix: config.keyPrefix,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy: (times: number): number | null => {
        if (times > 10) {
          this.logger.error(
            `Redis connection failed after ${times} retries. Giving up.`,
          );
          return null;
        }
        const delay = Math.min(times * 200, 2000);
        this.logger.warn(
          `Redis reconnecting... attempt ${times}, delay ${delay}ms`,
        );
        return delay;
      },
      reconnectOnError: (err: Error): boolean => {
        this.logger.warn(`Redis error (will reconnect): ${err.message}`);
        return true;
      },
    });

    this.client.on('connect', () =>
      this.logger.log('Redis client connected'),
    );
    this.client.on('ready', () =>
      this.logger.log('Redis client ready'),
    );
    this.client.on('error', (err: Error) =>
      this.logger.error(`Redis client error: ${err.message}`),
    );
    this.client.on('close', () =>
      this.logger.warn('Redis client connection closed'),
    );
    this.client.on('reconnecting', () =>
      this.logger.warn('Redis client reconnecting...'),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis client disconnected gracefully');
  }

  // ─── Raw client access (for BullMQ etc.) ─────────────────────────────────

  getClient(): IORedis {
    return this.client;
  }

  // ─── Key helpers ──────────────────────────────────────────────────────────

  buildKey(...parts: string[]): string {
    return parts.join(':');
  }

  // ─── Core operations ──────────────────────────────────────────────────────

  async get<T = string>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set(key: string, value: unknown, options?: SetOptions): Promise<void> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (options?.ttl !== undefined && options.nx) {
      await this.client.set(key, serialized, 'EX', options.ttl, 'NX');
    } else if (options?.ttl !== undefined) {
      await this.client.set(key, serialized, 'EX', options.ttl);
    } else if (options?.nx) {
      await this.client.set(key, serialized, 'NX');
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  async exists(...keys: string[]): Promise<boolean> {
    const count = await this.client.exists(...keys);
    return count > 0;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async increment(key: string, by = 1): Promise<number> {
    return this.client.incrby(key, by);
  }

  async decrement(key: string, by = 1): Promise<number> {
    return this.client.decrby(key, by);
  }

  // ─── Hash operations ──────────────────────────────────────────────────────

  async hset(key: string, field: string, value: unknown): Promise<void> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.hset(key, field, serialized);
  }

  async hget<T = string>(key: string, field: string): Promise<T | null> {
    const raw = await this.client.hget(key, field);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(key, ...fields);
  }

  async hgetall<T extends Record<string, unknown>>(
    key: string,
  ): Promise<T | null> {
    const raw = await this.client.hgetall(key);
    if (!raw || Object.keys(raw).length === 0) return null;
    const parsed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      try {
        parsed[k] = JSON.parse(v);
      } catch {
        parsed[k] = v;
      }
    }
    return parsed as T;
  }

  // ─── Pub / Sub ────────────────────────────────────────────────────────────

  async publish(channel: string, message: unknown): Promise<number> {
    const payload =
      typeof message === 'string' ? message : JSON.stringify(message);
    return this.client.publish(channel, payload);
  }

  async subscribe(
    channel: string,
    handler: (message: string) => void,
  ): Promise<IORedis> {
    // Each subscriber needs its own connection
    const subscriber = this.client.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (_ch: string, msg: string) => handler(msg));
    return subscriber;
  }

  // ─── Distributed Lock (Redlock-lite) ─────────────────────────────────────

  async lock(
    resource: string,
    ttlMs: number = REDIS_LOCK_TTL_MS,
  ): Promise<LockResult> {
    const lockKey = this.buildKey(REDIS_NAMESPACES.LOCK, resource);
    const token = `${Date.now()}-${Math.random()}`;
    const result = await this.client.set(lockKey, token, 'PX', ttlMs, 'NX');

    if (result === 'OK') {
      return { acquired: true, lockKey };
    }

    return { acquired: false, lockKey };
  }

  async unlock(resource: string): Promise<void> {
    const lockKey = this.buildKey(REDIS_NAMESPACES.LOCK, resource);
    await this.client.del(lockKey);
  }

  // ─── Health check ─────────────────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async info(): Promise<string> {
    return this.client.info();
  }
}
