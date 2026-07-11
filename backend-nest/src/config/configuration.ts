import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  corsOrigin: string[];
  throttleTtl: number;
  throttleLimit: number;
  logLevel: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  keyPrefix: string;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env['PORT'] ?? '5000', 10),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    isDevelopment: (process.env['NODE_ENV'] ?? 'development') === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
    corsOrigin: (process.env['CORS_ORIGIN'] ?? 'http://localhost:3000').split(
      ',',
    ),
    throttleTtl: parseInt(process.env['THROTTLE_TTL'] ?? '60', 10),
    throttleLimit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
    logLevel: process.env['LOG_LEVEL'] ?? 'info',
  }),
);

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env['DATABASE_URL'] ?? '',
  }),
);

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] ?? '',
    db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
    keyPrefix: process.env['REDIS_KEY_PREFIX'] ?? 'prayukti:',
  }),
);

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env['JWT_SECRET'] ?? '',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? '',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  }),
);

export const emailConfig = registerAs(
  'email',
  (): EmailConfig => ({
    host: process.env['EMAIL_HOST'] ?? 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] ?? '587', 10),
    user: process.env['EMAIL_USER'] ?? '',
    pass: process.env['EMAIL_PASS'] ?? '',
    from:
      process.env['EMAIL_FROM'] ?? 'Prayukti vLAB <noreply@prayukti.com>',
  }),
);
