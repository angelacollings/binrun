import { test, expect } from '@playwright/test';

test('renders BinRun heading', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.headers()['x-frame-options']).toBe('DENY');
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  await expect(page).toHaveTitle('Bin day? Sorted. | BinRun');
  await expect(page.getByRole('heading', { name: 'BinRun' })).toBeVisible();
  await expect(page.getByText('Bin day? Sorted.')).toBeVisible();
});

test('publishes branded browser and social metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /icon\.svg/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /opengraph-image/
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image'
  );

  const socialImage = await page.request.get('/opengraph-image');
  expect(socialImage.ok()).toBe(true);
  expect(socialImage.headers()['content-type']).toContain('image/png');
});

test('reports a healthy database without exposing connection details', async ({ request }) => {
  const response = await request.get('/api/health/db');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual({ ok: true });
});
