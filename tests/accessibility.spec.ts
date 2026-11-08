import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const localSeedPassword = 'BinRun-local-2026';
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(localSeedPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

for (const [name, path] of [
  ['landing page', '/'],
  ['login page', '/login'],
  ['registration page', '/register'],
  ['pricing page', '/pricing'],
] as const) {
  test(`${name} has no automatically detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoA11yViolations(page);
  });
}

test('customer dashboard has no automatically detectable WCAG A or AA violations', async ({
  page,
}) => {
  await signIn(page, 'angela@example.com');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expectNoA11yViolations(page);
});

test('worker run board has no automatically detectable WCAG A or AA violations', async ({
  page,
}) => {
  await signIn(page, 'worker@example.com');
  await expect(page).toHaveURL(/\/worker$/);
  await expectNoA11yViolations(page);
});
