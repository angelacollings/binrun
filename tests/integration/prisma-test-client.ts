import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

export function createPrismaTestClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run integration tests.');
  }

  return new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
    log: ['warn', 'error'],
  });
}
