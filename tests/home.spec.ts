import { test, expect } from '@playwright/test';

test('renders BinRun heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'BinRun' })).toBeVisible();
  await expect(page.getByText('Bin day? Sorted.')).toBeVisible();
});
