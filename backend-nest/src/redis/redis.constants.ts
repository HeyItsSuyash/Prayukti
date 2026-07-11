/**
 * Redis namespace constants for key construction.
 * Always use these constants to avoid typos and enable easy refactoring.
 */
export const REDIS_NAMESPACES = {
  // Auth
  AUTH_OTP: 'auth:otp',
  AUTH_BLACKLIST: 'auth:blacklist',

  // Session
  SESSION: 'session',

  // Cache
  CACHE_SUBJECTS: 'cache:subjects',
  CACHE_DASHBOARD: 'cache:dashboard',
  CACHE_EXPERIMENTS: 'cache:experiments',
  CACHE_INSTITUTIONS: 'cache:institutions',

  // Experiments
  EXPERIMENT: 'experiment',

  // Rate limiting
  RATE_LIMIT: 'ratelimit',

  // Locks
  LOCK: 'lock',

  // Pub/Sub channels
  CHANNEL_NOTIFICATIONS: 'channel:notifications',
  CHANNEL_AI_EVENTS: 'channel:ai-events',
} as const;

export type RedisNamespace =
  (typeof REDIS_NAMESPACES)[keyof typeof REDIS_NAMESPACES];

/** Injection token for the raw IORedis client */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/** Default lock TTL in milliseconds */
export const REDIS_LOCK_TTL_MS = 30_000;

/** Default cache TTL in seconds */
export const REDIS_DEFAULT_TTL_S = 300; // 5 minutes
