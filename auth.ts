import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

import { getAuthEnv } from './lib/env';
import { hashPassword, verifyPassword } from './lib/auth/password';
import { prisma } from './lib/prisma';

const authEnv = getAuthEnv();

export const auth = betterAuth({
  baseURL: authEnv.authUrl,
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) => verifyPassword(hash, password),
    },
  },
  plugins: [nextCookies()],
  rateLimit: {
    enabled: true,
    max: 100,
    storage: 'memory',
    window: 60,
    customRules: {
      '/sign-in/email': {
        max: 5,
        window: 15 * 60,
      },
      '/sign-up/email': {
        max: 5,
        window: 15 * 60,
      },
    },
  },
  secret: authEnv.authSecret,
  session: {
    disableSessionRefresh: true,
    expiresIn: 60 * 30,
    freshAge: 60 * 10,
  },
  trustedOrigins: authEnv.authUrl ? [authEnv.authUrl] : undefined,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'CUSTOMER',
        input: false,
        required: true,
      },
    },
  },
});
