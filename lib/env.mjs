const placeholderPattern =
  /^(replace-with-|sk_test_placeholder$|whsec_placeholder$|price_placeholder_|smtp\.example\.com$)/;
const localAuthDefaults = {
  secret: 'K6HFL4VmJmil8FRIZlMzHCMGq7Pv7M9Ey/YSXmg1UD8=',
  url: 'http://localhost:3000',
};
const localDatabaseHosts = new Set(['localhost', '127.0.0.1', '::1', 'db']);

function runtimeEnvironment(value) {
  if (value === 'production' || value === 'test' || value === 'development') {
    return value;
  }

  return 'development';
}

function requireEnv(source, name) {
  const value = source[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireProductionValue(source, name) {
  const value = requireEnv(source, name);

  if (runtimeEnvironment(source.NODE_ENV) === 'production' && placeholderPattern.test(value)) {
    throw new Error(`Production environment variable ${name} must not use a placeholder value.`);
  }

  return value;
}

function optionalProductionValue(source, name) {
  const value = source[name]?.trim();

  if (!value) {
    return undefined;
  }

  if (runtimeEnvironment(source.NODE_ENV) === 'production' && placeholderPattern.test(value)) {
    throw new Error(`Production environment variable ${name} must not use a placeholder value.`);
  }

  return value;
}

function requireUrl(source, name) {
  const value = requireProductionValue(source, name);

  try {
    new URL(value);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }

  return value;
}

function optionalUrl(source, name) {
  const value = optionalProductionValue(source, name);

  if (!value) {
    return undefined;
  }

  try {
    new URL(value);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }

  return value;
}

function optionalLocalAuthSecret(source) {
  const value = source.AUTH_SECRET?.trim();

  if (!value || value.length < 32) {
    return localAuthDefaults.secret;
  }

  return value;
}

function isLocalDatabaseTarget(source) {
  const value = source.DATABASE_URL?.trim();

  if (!value) {
    return false;
  }

  try {
    return localDatabaseHosts.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

function isLocalProductionBuild(source) {
  return source.npm_lifecycle_event === 'build' && isLocalDatabaseTarget(source);
}

function requireInteger(source, name) {
  const value = requireProductionValue(source, name);
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer.`);
  }

  return parsed;
}

export function getDatabaseEnv(source = process.env) {
  return {
    databaseUrl: requireUrl(source, 'DATABASE_URL'),
    nodeEnv: runtimeEnvironment(source.NODE_ENV),
  };
}

export function getAuthEnv(source = process.env) {
  const nodeEnv = runtimeEnvironment(source.NODE_ENV);
  const sourceWithResolvedNames = {
    ...source,
    AUTH_SECRET: source.BETTER_AUTH_SECRET ?? source.AUTH_SECRET,
    AUTH_URL: source.BETTER_AUTH_URL ?? source.AUTH_URL,
  };
  const isProduction = nodeEnv === 'production';
  const canUseLocalDefaults = !isProduction || isLocalProductionBuild(source);
  const authSecret = canUseLocalDefaults
    ? optionalLocalAuthSecret(sourceWithResolvedNames)
    : requireProductionValue(sourceWithResolvedNames, 'AUTH_SECRET');
  const authUrl = canUseLocalDefaults
    ? (optionalUrl(sourceWithResolvedNames, 'AUTH_URL') ?? localAuthDefaults.url)
    : requireUrl(sourceWithResolvedNames, 'AUTH_URL');

  return {
    authSecret,
    authUrl,
    nodeEnv,
  };
}

export function getStripeEnv(source = process.env) {
  return {
    oneOffCleanPriceId: requireProductionValue(source, 'STRIPE_PRICE_ONE_OFF_CLEAN'),
    regularRunPriceId: requireProductionValue(source, 'STRIPE_PRICE_REGULAR_RUN'),
    regularRunPlusWashPriceId: requireProductionValue(source, 'STRIPE_PRICE_REGULAR_RUN_PLUS_WASH'),
    stripeSecretKey: requireProductionValue(source, 'STRIPE_SECRET_KEY'),
    stripeWebhookSecret: requireProductionValue(source, 'STRIPE_WEBHOOK_SECRET'),
  };
}

export function getEmailEnv(source = process.env) {
  return {
    emailFrom: requireProductionValue(source, 'EMAIL_FROM'),
    smtpHost: requireProductionValue(source, 'SMTP_HOST'),
    smtpPort: requireInteger(source, 'SMTP_PORT'),
    smtpUser: requireProductionValue(source, 'SMTP_USER'),
    smtpPassword: requireProductionValue(source, 'SMTP_PASSWORD'),
  };
}

export function assertNoPublicRuntimeSecrets(source = process.env) {
  const publicSecretNames = Object.keys(source).filter((name) => {
    return (
      name.startsWith('NEXT_PUBLIC_') &&
      /(SECRET|TOKEN|PASSWORD|DATABASE|PRIVATE|WEBHOOK|AUTH|STRIPE)/i.test(name)
    );
  });

  if (publicSecretNames.length > 0) {
    throw new Error(
      `Refusing to expose secret-like public environment variables: ${publicSecretNames.join(', ')}`
    );
  }
}
