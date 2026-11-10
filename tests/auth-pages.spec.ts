import { expect, test } from '@playwright/test';

import { createPrismaTestClient } from './integration/prisma-test-client';

test.afterAll(async () => {
  const prisma = createPrismaTestClient();

  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'portfolio-smoke-',
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test('renders shared login page with email and password fields', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle('Sign in | BinRun');
  await expect(page.getByRole('heading', { name: 'Sign in to BinRun' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveAttribute('type', 'email');
  await expect(page.getByLabel('Password')).toHaveAttribute('autocomplete', 'current-password');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('renders customer service signup and account creation form', async ({ page }) => {
  await page.goto('/register');

  await expect(page).toHaveTitle('Start service | BinRun');
  await expect(page.getByRole('heading', { name: 'Set up your bin run' })).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveAttribute('autocomplete', 'email');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'autocomplete',
    'new-password'
  );
  await expect(page.getByLabel('Confirm password')).toHaveAttribute('autocomplete', 'new-password');
  await expect(page.getByLabel('Service address')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Service package' })).toBeVisible();
  await expect(page.getByText('Regular Run', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create account and start service' })
  ).toBeVisible();
});

test('customer can create an account and reach their new service dashboard', async ({
  page,
}, testInfo) => {
  const customerName = 'Portfolio Smoke Customer';
  const email = `portfolio-smoke-${Date.now()}-${testInfo.retry}@example.com`;
  const password = 'BinRun-smoke-2026';

  await page.goto('/register');
  await page.getByLabel('Full name').fill(customerName);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByLabel('Service address').fill('49 Portfolio Place');
  await page.getByLabel('Suburb').fill('Avenues');
  await page.getByLabel('Postcode').fill('0110');
  await page.getByRole('radio', { name: /^Regular Run Weekly/ }).check();
  await page.getByRole('button', { name: 'Create account and start service' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: `Welcome, ${customerName}` })).toBeVisible();

  const homeProperty = page.getByRole('article', { name: 'Home', exact: true });
  await expect(homeProperty.getByText('49 Portfolio Place')).toBeVisible();
  await expect(homeProperty.getByText('Regular Run', { exact: true })).toBeVisible();
  await expect(homeProperty.getByText('Pending', { exact: true })).toBeVisible();
});

test('renders pricing page with service packages and assisted setup', async ({ page }) => {
  await page.goto('/pricing');

  await expect(page).toHaveTitle('Pricing | BinRun');
  await expect(page.getByRole('heading', { name: 'Simple packages' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Regular Run', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Regular Run + Wash' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Need help signing up?' })).toBeVisible();
  await expect(page.getByText('admin@binrun.co.nz')).toBeVisible();
});
