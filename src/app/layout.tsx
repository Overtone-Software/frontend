import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

/**
 * One family, used across its full weight range.
 *
 * Manrope's circular bowls and tight apertures are the closest match to the
 * wordmark in the logo, so the interface and the mark read as one thing. A second
 * display face would only compete with it.
 */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://overtone-rho.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Each page sets its own full title; this is only the fallback for the ones
  // that do not, which are the auth screens.
  title: 'Overtone — earnings call research you can defend',
  description:
    'Capture an earnings call, ask questions about it, and get answers cited to the exact moment management said it.',
  icons: { icon: '/icon.png' },
  openGraph: {
    type: 'website',
    siteName: 'Overtone',
    title: 'Overtone — earnings call research you can defend',
    description:
      'Every answer points at the second it was said. Capture, question and compare earnings calls.',
    images: [{ url: '/logo-full.png', width: 720, height: 161, alt: 'Overtone' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Overtone — earnings call research you can defend',
    description: 'Every answer points at the second it was said.',
    images: ['/logo-full.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.className}>
      <body>{children}</body>
    </html>
  );
}
