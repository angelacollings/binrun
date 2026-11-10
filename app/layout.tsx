import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://binrun.co.nz'),
  title: {
    default: 'BinRun',
    template: '%s | BinRun',
  },
  description:
    'Wheelie bin set-out, return, and cleaning services for Whangarei households and properties.',
  openGraph: {
    description:
      'Wheelie bin set-out, return, and cleaning services for Whangarei households and properties.',
    locale: 'en_NZ',
    siteName: 'BinRun',
    title: 'Bin day? Sorted. | BinRun',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    description:
      'Wheelie bin set-out, return, and cleaning services for Whangarei households and properties.',
    title: 'Bin day? Sorted. | BinRun',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
