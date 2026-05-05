import Redis from 'ioredis';
import logger from './logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

export default redis;
