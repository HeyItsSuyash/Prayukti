import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

export async function createDrizzleConnection(
  databaseUrl: string,
): Promise<DrizzleDB> {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 50,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  // Test the connection
  const client = await pool.connect();
  client.release();

  return drizzle(pool, { schema, logger: false });
}
