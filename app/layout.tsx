import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BinRun',
  description: 'Bin day? Sorted.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // if (process.env.NODE_ENV === 'development') {
  //   throw new Error('Global error smoke test');
  // }
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
