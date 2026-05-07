type AttemptBucket = {
  count: number;
  expiresAt: number;
};

type ThrottleOptions = {
  limit: number;
  now?: number;
  store?: Map<string, AttemptBucket>;
  windowMs: number;
};

const authAttemptStore = new Map<string, AttemptBucket>();

export type ThrottleResult =
  | {
      allowed: true;
      remaining: number;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
    };

export const authThrottlePolicy = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
} as const;

export function checkRateLimit(key: string, options: ThrottleOptions): ThrottleResult {
  const now = options.now ?? Date.now();
  const store = options.store ?? authAttemptStore;
  const existing = store.get(key);

  if (!existing || existing.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: options.limit - 1,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.expiresAt - now) / 1000),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: options.limit - existing.count,
  };
}

export function checkAuthRateLimit(key: string) {
  return checkRateLimit(key, {
    limit: authThrottlePolicy.limit,
    windowMs: authThrottlePolicy.windowMs,
  });
}
