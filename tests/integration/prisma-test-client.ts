import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

import { getMariaDbConfig } from '../../lib/env';

export function createPrismaTestClient() {
  return new PrismaClient({
    adapter: new PrismaMariaDb(getMariaDbConfig()),
    log: ['warn', 'error'],
  });
}
