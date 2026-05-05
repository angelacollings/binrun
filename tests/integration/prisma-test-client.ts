import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

import { getDatabaseEnv } from '../../lib/env';

export function createPrismaTestClient() {
  const { databaseUrl } = getDatabaseEnv();

  return new PrismaClient({
    adapter: new PrismaMariaDb(databaseUrl),
    log: ['warn', 'error'],
  });
}
