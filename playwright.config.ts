import { defineConfig, devices } from '@playwright/test';

const testBaseUrl = 'http://127.0.0.1:3100';
const testEnvironment = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => Boolean(entry[1]))
);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/integration/**'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: testBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    env: {
      ...testEnvironment,
      BETTER_AUTH_URL: testBaseUrl,
      NEXT_DIST_DIR: '.next-e2e',
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: testBaseUrl,
  },
});
