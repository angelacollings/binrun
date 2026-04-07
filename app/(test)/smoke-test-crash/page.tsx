/**
 * Development-only smoke test page.
 *
 * This page intentionally throws an error to test the global error boundary.
 * Used by Playwright E2E tests to verify the failsafe UI renders correctly.
 *
 * - Returns 404 in production (safe guard)
 * - Only useful during development
 * - Removed from production builds automatically
 *
 * @see tests/global-error.spec.ts for the corresponding test
 */

import { notFound } from 'next/navigation';

export default function SmokeCrashPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  throw new Error('Smoke test: intentional crash to verify global error boundary');
}
