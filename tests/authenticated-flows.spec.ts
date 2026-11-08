import { expect, test, type Page } from '@playwright/test';

const localSeedPassword = 'BinRun-local-2026';

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(localSeedPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test('customer signs in, sees owned dashboard data, and cannot access admin routes', async ({
  page,
}) => {
  await signIn(page, 'angela@example.com');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Welcome, Angela Collings' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Dashboard summary' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Active properties' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

  await page.goto('/admin');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Welcome, Angela Collings' })).toBeVisible();
});

test('worker signs in, sees the run board, and cannot access admin routes', async ({ page }) => {
  await signIn(page, 'worker@example.com');

  await expect(page).toHaveURL(/\/worker$/);
  await expect(page.getByRole('heading', { name: 'Service route access' })).toBeVisible();
  const runBoard = page.getByRole('region', { name: 'Service run board' });
  await expect(runBoard).toBeVisible();
  await expect(page.getByText('Upcoming visits')).toBeVisible();

  await runBoard.getByRole('button', { name: 'Update visit' }).first().click();
  await expect(runBoard.getByRole('status')).toHaveText('Visit updated.');

  await page.goto('/admin');

  await expect(page).toHaveURL(/\/worker$/);
  await expect(page.getByRole('heading', { name: 'Service route access' })).toBeVisible();
});
