/**
 * Queue name constants for BullMQ.
 * Use these everywhere instead of raw strings.
 */
export const QUEUE_NAMES = {
  EMAIL: 'email',
  NOTIFICATIONS: 'notifications',
  AI: 'ai',
  VIDEO: 'video',
  ANALYTICS: 'analytics',
  CERTIFICATE: 'certificate',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/** Default job options applied to all queues */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1_000,
  },
  removeOnComplete: {
    age: 24 * 3600, // keep completed jobs for 24h
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // keep failed jobs for 7d
  },
} as const;

/** Dead Letter Queue suffix */
export const DLQ_SUFFIX = ':dlq';
