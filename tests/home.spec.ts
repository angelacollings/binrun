import { test, expect } from '@playwright/test';

test('renders BinRun heading', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.headers()['x-frame-options']).toBe('DENY');
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  await expect(page).toHaveTitle('Bin day? Sorted. | BinRun');
  await expect(page.getByRole('heading', { name: 'BinRun' })).toBeVisible();
  await expect(page.getByText('Bin day? Sorted.')).toBeVisible();
});
