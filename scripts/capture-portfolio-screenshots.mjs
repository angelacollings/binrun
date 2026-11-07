import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const baseUrl = process.env.PORTFOLIO_BASE_URL ?? 'http://127.0.0.1:3000';
const outputDirectory = resolve('docs/screenshots');
const viewport = {
  height: 1000,
  width: 1440,
};

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();

async function capturePublicPage(path, filename) {
  const context = await browser.newContext({
    colorScheme: 'light',
    viewport,
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({
    animations: 'disabled',
    fullPage: true,
    path: resolve(outputDirectory, filename),
  });
  await context.close();
}

async function captureAuthenticatedPage({ email, filename, path }) {
  const context = await browser.newContext({
    colorScheme: 'light',
    viewport,
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill('BinRun-local-2026');
  await Promise.all([
    page.waitForURL((url) => url.pathname === path),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ]);
  await page.screenshot({
    animations: 'disabled',
    fullPage: true,
    path: resolve(outputDirectory, filename),
  });
  await context.close();
}

try {
  await capturePublicPage('/', 'landing-page.png');
  await captureAuthenticatedPage({
    email: 'angela@example.com',
    filename: 'customer-dashboard.png',
    path: '/dashboard',
  });
  await captureAuthenticatedPage({
    email: 'admin@example.com',
    filename: 'admin-run-board.png',
    path: '/admin',
  });
} finally {
  await browser.close();
}
