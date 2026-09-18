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

export const metadata: Metadata = {
  title: 'Overtone',
  description: 'Turn an earnings call into a cited, defensible research memo.',
  icons: { icon: '/icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.className}>
      <body>{children}</body>
    </html>
  );
}
