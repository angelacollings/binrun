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
        DATABASE_URL: 'mysql://binrun:binrun-local@127.0.0.1:3306/binrun',
        NODE_ENV: 'development',
      })
    ).toEqual({
      databaseUrl: 'mysql://binrun:binrun-local@127.0.0.1:3306/binrun',
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
        BETTER_AUTH_SECRET: 'production-auth-secret',
        BETTER_AUTH_URL: 'https://binrun.co.nz',
        NODE_ENV: 'production',
      })
    ).toMatchObject({
      authUrl: 'https://binrun.co.nz',
      nodeEnv: 'production',
    });
  });

  it('requires an explicit auth URL in production', () => {
    expect(() =>
      getAuthEnv({
        BETTER_AUTH_SECRET: 'production-auth-secret-with-enough-length',
        NODE_ENV: 'production',
      })
    ).toThrow('Missing required environment variable: AUTH_URL');
  });

  it('allows local production builds to use local Better Auth defaults', () => {
    expect(
      getAuthEnv({
        AUTH_SECRET: 'short-local-key',
        DATABASE_URL: 'mysql://binrun:binrun-local@127.0.0.1:3306/binrun',
        NODE_ENV: 'production',
        npm_lifecycle_event: 'build',
      })
    ).toMatchObject({
      authUrl: 'http://localhost:3000',
      nodeEnv: 'production',
    });
  });

  it('does not use local auth defaults for production runtime', () => {
    expect(() =>
      getAuthEnv({
        DATABASE_URL: 'mysql://binrun:binrun-local@127.0.0.1:3306/binrun',
        NODE_ENV: 'production',
      })
    ).toThrow('Missing required environment variable: AUTH_SECRET');
  });

  it('uses stable local Better Auth defaults outside production', () => {
    expect(getAuthEnv({ NODE_ENV: 'development' })).toMatchObject({
      authUrl: 'http://localhost:3000',
      nodeEnv: 'development',
    });
    expect(getAuthEnv({ NODE_ENV: 'development' }).authSecret.length).toBeGreaterThanOrEqual(32);
  });

  it('uses local defaults instead of short legacy development secrets', () => {
    expect(
      getAuthEnv({
        AUTH_SECRET: 'short-local-key',
        NODE_ENV: 'development',
      }).authSecret.length
    ).toBeGreaterThanOrEqual(32);
  });

  it('keeps legacy Auth.js env names as a migration fallback', () => {
    expect(
      getAuthEnv({
        AUTH_SECRET: 'legacy-local-auth-secret-with-enough-length',
        AUTH_URL: 'http://localhost:3000',
        NODE_ENV: 'development',
      })
    ).toMatchObject({
      authSecret: 'legacy-local-auth-secret-with-enough-length',
      authUrl: 'http://localhost:3000',
    });
  });

  it('rejects placeholder values in production secrets', () => {
    expect(() =>
      getStripeEnv({
        NODE_ENV: 'production',
        STRIPE_PRICE_CLEAN_BIN_VISIT: 'price_live_clean_bin_visit',
        STRIPE_PRICE_ONE_OFF_CLEAN: 'price_live_one_off_clean',
        STRIPE_PRICE_REGULAR_RUN: 'price_live_regular_run',
        STRIPE_PRICE_REGULAR_RUN_PLUS_WASH: 'price_live_regular_run_plus_wash',
        STRIPE_SECRET_KEY: 'sk_test_placeholder',
        STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      })
    ).toThrow(
      'Production environment variable STRIPE_SECRET_KEY must not use a placeholder value.'
    );
  });

  it('reads Stripe package price IDs', () => {
    expect(
      getStripeEnv({
        STRIPE_PRICE_CLEAN_BIN_VISIT: 'price_123_clean',
        STRIPE_PRICE_ONE_OFF_CLEAN: 'price_123_once',
        STRIPE_PRICE_REGULAR_RUN: 'price_123_regular',
        STRIPE_PRICE_REGULAR_RUN_PLUS_WASH: 'price_123_wash',
        STRIPE_SECRET_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123',
      })
    ).toEqual({
      cleanBinVisitPriceId: 'price_123_clean',
      oneOffCleanPriceId: 'price_123_once',
      regularRunPlusWashPriceId: 'price_123_wash',
      regularRunPriceId: 'price_123_regular',
      stripeSecretKey: 'sk_test_123',
      stripeWebhookSecret: 'whsec_123',
    });
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
