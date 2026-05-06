import { expect, test } from '@playwright/test';

test('renders shared login page with email and password fields', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Sign in to BinRun' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveAttribute('type', 'email');
  await expect(page.getByLabel('Password')).toHaveAttribute('autocomplete', 'current-password');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('renders customer service signup and account creation form', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByRole('heading', { name: 'Set up your bin run' })).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveAttribute('autocomplete', 'email');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'autocomplete',
    'new-password'
  );
  await expect(page.getByLabel('Confirm password')).toHaveAttribute('autocomplete', 'new-password');
  await expect(page.getByLabel('Service address')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Bins to move' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account and start service' })).toBeVisible();
});
