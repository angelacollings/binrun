import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client.');
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, _receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);

    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as PrismaClient;
