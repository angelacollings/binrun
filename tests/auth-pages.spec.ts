import { expect, test } from '@playwright/test';

test('renders passwordless login page with accessible email field', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Access your BinRun account' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveAttribute('type', 'email');
  await expect(page.getByRole('button', { name: 'Send sign-in link' })).toBeVisible();
  await expect(page.getByText('No password is needed.')).toBeVisible();
});

test('renders registration request page using the same secure email flow', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByRole('heading', { name: 'Start with your email' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveAttribute('autocomplete', 'email');
  await expect(page.getByRole('link', { name: 'Sign in instead' })).toHaveAttribute(
    'href',
    '/login'
  );
});
