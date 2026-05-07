import { describe, expect, it } from 'vitest';

import { checkRateLimit } from '../../lib/auth/throttle';

describe('auth throttling', () => {
  it('allows attempts until the configured limit is reached', () => {
    const store = new Map();
    const options = {
      limit: 2,
      now: 1_000,
      store,
      windowMs: 60_000,
    };

    expect(checkRateLimit('login:127.0.0.1:test@example.com', options)).toEqual({
      allowed: true,
      remaining: 1,
    });
    expect(checkRateLimit('login:127.0.0.1:test@example.com', options)).toEqual({
      allowed: true,
      remaining: 0,
    });
    expect(checkRateLimit('login:127.0.0.1:test@example.com', options)).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });

  it('resets the bucket after the window expires', () => {
    const store = new Map();
    const key = 'signup:127.0.0.1:test@example.com';

    checkRateLimit(key, {
      limit: 1,
      now: 1_000,
      store,
      windowMs: 60_000,
    });

    expect(
      checkRateLimit(key, {
        limit: 1,
        now: 61_000,
        store,
        windowMs: 60_000,
      })
    ).toEqual({
      allowed: true,
      remaining: 0,
    });
  });
});
