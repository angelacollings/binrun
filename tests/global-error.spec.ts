import { test, expect } from '@playwright/test';

test('shows failsafe UI when a fatal render error occurs', async ({ page }) => {
  await page.goto('/smoke-test-crash');

  await expect(page.getByRole('heading', { name: 'Something went wrong.' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();

  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});
