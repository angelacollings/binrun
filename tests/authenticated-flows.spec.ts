import { expect, test, type Page } from '@playwright/test';

import { createPrismaTestClient } from './integration/prisma-test-client';

const localSeedPassword = 'BinRun-local-2026';

test.afterAll(async () => {
  const prisma = createPrismaTestClient();

  try {
    await prisma.property.deleteMany({
      where: {
        label: 'Smoke test property',
        user: {
          email: 'angela@example.com',
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
});

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

  const addPropertyPanel = page.locator('details').filter({
    has: page.getByRole('heading', { name: 'Add property' }),
  });
  await expect(addPropertyPanel).not.toHaveAttribute('open');
  await addPropertyPanel.getByRole('heading', { name: 'Add property' }).click();
  await expect(addPropertyPanel.getByLabel('Address line 1')).toBeVisible();

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

  const restoredHomeProperty = page.getByRole('article', { name: 'Home', exact: true });
  await restoredHomeProperty.getByLabel('Label').first().fill('Red and blue recycling bins');
  await restoredHomeProperty.getByRole('button', { name: 'Save bin' }).first().click();
  await expect(page.getByRole('status')).toHaveText('Bin updated.');
});

test('customer can add and safely deactivate a property without an active service', async ({
  page,
}) => {
  await signIn(page, 'angela@example.com');

  const addPropertyPanel = page.locator('details').filter({
    has: page.getByRole('heading', { name: 'Add property' }),
  });
  await addPropertyPanel.getByRole('heading', { name: 'Add property' }).click();
  await addPropertyPanel.getByLabel('Label').fill('Smoke test property');
  await addPropertyPanel.getByLabel('Address line 1').fill('49 Portfolio Place');
  await addPropertyPanel.getByLabel('Suburb').fill('Avenues');
  await addPropertyPanel.getByLabel('Postcode').fill('0110');
  await addPropertyPanel.getByRole('button', { name: 'Add property' }).click();

  await expect(page).toHaveURL(/properties=created/);
  await expect(page.getByRole('status')).toHaveText('Property added.');

  const property = page.getByRole('article', { name: 'Smoke test property' });
  await expect(property.getByText('49 Portfolio Place')).toBeVisible();
  await property.getByText('Edit property details').click();
  await property.getByLabel('Confirm property removal').check();
  await property.getByRole('button', { name: 'Remove property' }).click();

  await expect(page).toHaveURL(/properties=deactivated/);
  await expect(page.getByRole('status')).toHaveText('Property removed from active service.');
  await expect(page.getByRole('article', { name: 'Smoke test property' })).toHaveCount(0);
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
