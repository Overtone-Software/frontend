import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Overtone',
  description: 'Turn an earnings call into a cited, defensible research memo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
