'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, readSession } from '@/lib/api';

const LINKS = [
  { href: '/calls', label: 'Calls' },
  { href: '/memos', label: 'Memos' },
  { href: '/usage', label: 'Usage' },
  { href: '/pricing', label: 'Plans' },
  { href: '/settings', label: 'Settings' },
];

/**
 * Authenticated shell.
 *
 * Renders nothing until the session check completes, so a signed-in user never
 * sees a flash of the login screen on a hard refresh.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setEmail(session.email);
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Overtone</div>
        <nav className="nav">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} data-active={pathname.startsWith(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 24, paddingLeft: 10, fontSize: 12, color: 'var(--muted)' }}>
          <div style={{ marginBottom: 6, wordBreak: 'break-all' }}>{email}</div>
          <button
            className="btn"
            style={{ fontSize: 12, padding: '4px 10px' }}
            onClick={() => {
              // Revoke the refresh token server-side too; clearing the tab's copy
              // alone would leave a usable session behind.
              void api.logout().finally(() => router.replace('/login'));
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
