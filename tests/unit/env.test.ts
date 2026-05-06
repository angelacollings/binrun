import { describe, expect, it } from 'vitest';

import {
  assertNoPublicRuntimeSecrets,
  getAuthEnv,
  getDatabaseEnv,
  getEmailEnv,
  getStripeEnv,
} from '../../lib/env';

describe('environment validation', () => {
  it('returns database config for a valid local database URL', () => {
    expect(
      getDatabaseEnv({
        DATABASE_URL: 'mysql://binrun:binrun-local@localhost:3306/binrun',
        NODE_ENV: 'development',
      })
    ).toEqual({
      databaseUrl: 'mysql://binrun:binrun-local@localhost:3306/binrun',
      nodeEnv: 'development',
    });
  });

  it('raises clear errors for missing required variables', () => {
    expect(() => getDatabaseEnv({})).toThrow('Missing required environment variable: DATABASE_URL');
  });

  it('raises clear errors for invalid URL variables', () => {
    expect(() =>
      getDatabaseEnv({
        DATABASE_URL: 'not-a-url',
      })
    ).toThrow('Environment variable DATABASE_URL must be a valid URL.');
  });

  it('uses secure cookie defaults for production auth config', () => {
    expect(
      getAuthEnv({
        AUTH_SECRET: 'production-auth-secret',
        AUTH_TRUST_HOST: 'true',
        AUTH_URL: 'https://binrun.co.nz',
        NODE_ENV: 'production',
      })
    ).toMatchObject({
      authTrustHost: true,
      authUrl: 'https://binrun.co.nz',
      nodeEnv: 'production',
      secureCookies: true,
    });
  });

  it('allows auth URL to be supplied by the hosting request context', () => {
    expect(
      getAuthEnv({
        AUTH_SECRET: 'production-auth-secret',
        NODE_ENV: 'production',
      })
    ).toMatchObject({
      authTrustHost: false,
      authUrl: undefined,
      nodeEnv: 'production',
    });
  });

  it('rejects placeholder values in production secrets', () => {
    expect(() =>
      getStripeEnv({
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_test_placeholder',
        STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      })
    ).toThrow(
      'Production environment variable STRIPE_SECRET_KEY must not use a placeholder value.'
    );
  });

  it('validates email port as a positive integer', () => {
    expect(
      getEmailEnv({
        EMAIL_FROM: 'admin@binrun.co.nz',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PASSWORD: 'local-password',
        SMTP_PORT: '587',
        SMTP_USER: 'local-user',
      }).smtpPort
    ).toBe(587);

    expect(() =>
      getEmailEnv({
        EMAIL_FROM: 'admin@binrun.co.nz',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PASSWORD: 'local-password',
        SMTP_PORT: 'not-a-port',
        SMTP_USER: 'local-user',
      })
    ).toThrow('Environment variable SMTP_PORT must be a positive integer.');
  });

  it('rejects secret-like public environment variable names', () => {
    expect(() =>
      assertNoPublicRuntimeSecrets({
        NEXT_PUBLIC_STRIPE_SECRET_KEY: 'do-not-expose',
      })
    ).toThrow(
      'Refusing to expose secret-like public environment variables: NEXT_PUBLIC_STRIPE_SECRET_KEY'
    );
  });
});
