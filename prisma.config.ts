import 'dotenv/config';
import { defineConfig } from 'prisma/config';

import { getDatabaseEnv } from './lib/env';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.mjs',
  },
  datasource: {
    url: getDatabaseEnv().databaseUrl,
  },
});
