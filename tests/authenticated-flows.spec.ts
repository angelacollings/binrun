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
  await expect(page).toHaveTitle('Customer dashboard | BinRun');
  await expect(page.getByRole('heading', { name: 'Welcome, Angela Collings' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Dashboard summary' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Active properties' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

  await page.goto('/admin');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Welcome, Angela Collings' })).toBeVisible();
});

test('customer can review and update bins for an owned property', async ({ page }) => {
  await signIn(page, 'angela@example.com');

  const homeProperty = page.getByRole('article', { name: 'Home', exact: true });
  await expect(homeProperty.getByText('3 bins')).toBeVisible();
  await homeProperty.getByText('Manage bins', { exact: true }).click();

  await expect(homeProperty.getByRole('heading', { name: 'Bins at this property' })).toBeVisible();
  const firstLabel = homeProperty.getByLabel('Label').first();
  await firstLabel.fill('Household recycling');
  await homeProperty.getByRole('button', { name: 'Save bin' }).first().click();

  await expect(page).toHaveURL(/bins=updated/);
  await expect(page.getByRole('status')).toHaveText('Bin updated.');
  await expect(
    page.getByRole('article', { name: 'Home', exact: true }).getByRole('heading', {
      name: 'Household recycling',
    })
  ).toBeVisible();

  const updatedHomeProperty = page.getByRole('article', { name: 'Home', exact: true });
  await updatedHomeProperty.getByLabel('Bin type').selectOption('RUBBISH_WHEELIE');
  await updatedHomeProperty.getByPlaceholder('Optional nickname').fill('Spare wheelie');
  await updatedHomeProperty.getByRole('button', { name: 'Add bin' }).click();

  await expect(page.getByRole('status')).toHaveText('Bin added.');
  await expect(
    page.getByRole('article', { name: 'Home', exact: true }).getByText('4 bins')
  ).toBeVisible();

  const spareBin = page.getByRole('article', { name: 'Spare wheelie' });
  await spareBin.getByLabel('Confirm bin removal').check();
  await spareBin.getByRole('button', { name: 'Remove bin' }).click();

  await expect(page.getByRole('status')).toHaveText('Bin removed.');
  await expect(
    page.getByRole('article', { name: 'Home', exact: true }).getByText('3 bins')
  ).toBeVisible();
  await expect(page.getByRole('article', { name: 'Spare wheelie' })).toHaveCount(0);
});

test('worker signs in, sees the run board, and cannot access admin routes', async ({ page }) => {
  await signIn(page, 'worker@example.com');

  await expect(page).toHaveURL(/\/worker$/);
  await expect(page).toHaveTitle('Worker run board | BinRun');
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
