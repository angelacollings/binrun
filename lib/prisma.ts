import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { getDatabaseEnv, getMariaDbConfig } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const { nodeEnv } = getDatabaseEnv();

  const adapter = new PrismaMariaDb(getMariaDbConfig());
  const client = new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  });

  if (nodeEnv !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);

    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as PrismaClient;
