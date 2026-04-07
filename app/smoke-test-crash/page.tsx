import { notFound } from 'next/navigation';

export default function SmokeCrashPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  throw new Error('Smoke test: intentional crash to verify global error boundary');
}
