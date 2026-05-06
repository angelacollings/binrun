const placeholderPattern =
  /^(replace-with-|sk_test_placeholder$|whsec_placeholder$|smtp\.example\.com$)/;

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
  const value = source[name]?.trim();

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

  return {
    authSecret: requireProductionValue(source, 'AUTH_SECRET'),
    authTrustHost: source.AUTH_TRUST_HOST === 'true',
    authUrl: optionalUrl(source, 'AUTH_URL'),
    nodeEnv,
    secureCookies: nodeEnv === 'production',
  };
}

export function getStripeEnv(source = process.env) {
  return {
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
