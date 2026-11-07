import {
  assertNoPublicRuntimeSecrets as assertNoPublicRuntimeSecretsUntyped,
  getAuthEnv as getAuthEnvUntyped,
  getDatabaseEnv as getDatabaseEnvUntyped,
  getEmailEnv as getEmailEnvUntyped,
  getMariaDbConfig as getMariaDbConfigUntyped,
  getStripeEnv as getStripeEnvUntyped,
} from './env.mjs';

export type EnvSource = Record<string, string | undefined>;

export type RuntimeEnvironment = 'development' | 'test' | 'production';

export type DatabaseEnv = {
  databaseUrl: string;
  nodeEnv: RuntimeEnvironment;
};

export type MariaDbConfig = {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
};

export type AuthEnv = {
  authSecret: string;
  authUrl: string;
  nodeEnv: RuntimeEnvironment;
};

export type StripeEnv = {
  oneOffCleanPriceId: string;
  regularRunPriceId: string;
  regularRunPlusWashPriceId: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
};

export type EmailEnv = {
  emailFrom: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
};

const readDatabaseEnv = getDatabaseEnvUntyped as unknown as (source?: EnvSource) => DatabaseEnv;
const readMariaDbConfig = getMariaDbConfigUntyped as unknown as (
  source?: EnvSource
) => MariaDbConfig;
const readAuthEnv = getAuthEnvUntyped as unknown as (source?: EnvSource) => AuthEnv;
const readStripeEnv = getStripeEnvUntyped as unknown as (source?: EnvSource) => StripeEnv;
const readEmailEnv = getEmailEnvUntyped as unknown as (source?: EnvSource) => EmailEnv;
const checkPublicRuntimeSecrets = assertNoPublicRuntimeSecretsUntyped as unknown as (
  source?: EnvSource
) => void;

export function getDatabaseEnv(source: EnvSource = process.env): DatabaseEnv {
  return readDatabaseEnv(source);
}

export function getMariaDbConfig(source: EnvSource = process.env): MariaDbConfig {
  return readMariaDbConfig(source);
}

export function getAuthEnv(source: EnvSource = process.env): AuthEnv {
  return readAuthEnv(source);
}

export function getStripeEnv(source: EnvSource = process.env): StripeEnv {
  return readStripeEnv(source);
}

export function getEmailEnv(source: EnvSource = process.env): EmailEnv {
  return readEmailEnv(source);
}

export function assertNoPublicRuntimeSecrets(source: EnvSource = process.env) {
  checkPublicRuntimeSecrets(source);
}
