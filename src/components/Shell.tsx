'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, readSession, type SessionInfo } from '@/lib/api';
import { BackendStatus } from './BackendStatus';

const LINKS = [
  { href: '/overview', label: 'Overview' },
  { href: '/calls', label: 'Calls' },
  { href: '/coverage', label: 'Coverage' },
  { href: '/theses', label: 'Theses' },
  { href: '/memos', label: 'Memos' },
  { href: '/usage', label: 'Usage' },
  { href: '/settings', label: 'Settings' },
];

/** Two letters from a name, falling back to the email — never a broken blank disc. */
export function initials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return '·';
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  return (first + second).toUpperCase();
}

/**
 * Authenticated frame.
 *
 * Renders nothing until the session check completes, so a signed-in analyst never
 * sees a flash of the login screen on a hard refresh.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setEmail(session.email);
    setChecked(true);
    api.me().then(setInfo).catch(() => undefined);
  }, [router]);

  if (!checked) return null;

  const org = info?.organizations.find((o) => o.id === info.active_organization_id)
    ?? info?.organizations[0];

  return (
    <div className="shell">
      <aside className="rail">
        <Link href="/overview" className="rail__logo" aria-label="Overtone — overview" />

        <nav className="nav">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} data-active={pathname.startsWith(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="whoami">
          <div className="disc" aria-hidden="true">
            {initials(info?.user.full_name ?? '', info?.user.email ?? email)}
          </div>
          <div className="whoami__text">
            <div className="whoami__name">{info?.user.full_name || email}</div>
            <div className="whoami__org">{org?.name ?? 'Loading workspace…'}</div>
            <button
              className="tab"
              style={{ padding: '2px 0', fontSize: 12.5, borderBottom: 0 }}
              onClick={() => {
                // Revoke server-side too; clearing this tab's copy alone would
                // leave a usable refresh token behind.
                void api.logout().finally(() => router.replace('/login'));
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <BackendStatus />
        {children}
      </main>
    </div>
  );
}
