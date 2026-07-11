import {
  Global,
  Module,
  Logger,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_CONNECTION, createDrizzleConnection, DrizzleDB } from './drizzle/drizzle.connection';
import type { DatabaseConfig } from '../config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (
        configService: ConfigService,
      ): Promise<DrizzleDB> => {
        const logger = new Logger('DatabaseModule');
        const dbConfig = configService.get<DatabaseConfig>('database')!;

        try {
          logger.log('Connecting to PostgreSQL via Drizzle ORM...');
          const db = await createDrizzleConnection(dbConfig.url);
          logger.log('PostgreSQL connection established successfully');
          return db;
        } catch (err) {
          logger.error(
            `Failed to connect to PostgreSQL: ${(err as Error).message}`,
          );
          throw err;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
