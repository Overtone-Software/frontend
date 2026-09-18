'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { readSession } from '@/lib/api';

const NAV = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Public shell for everything a signed-out visitor can reach.
 *
 * Kept separate from `Shell`, which redirects to the login screen — a marketing page
 * that bounces an unauthenticated visitor would be useless, and the privacy policy
 * has to stay readable by a Chrome Web Store reviewer with no account at all.
 */
export function Site({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Someone already signed in should be offered their dashboard, not a sign-up form.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(readSession() !== null), []);

  return (
    <div className="site">
      <header className="topbar">
        <div className="topbar__inner">
          <Link href="/" className="mark" aria-label="Overtone — home" />
          <nav className="topnav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} data-active={pathname === item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="spacer" />
          {signedIn ? (
            <Link className="btn btn--primary" href="/overview">Open dashboard</Link>
          ) : (
            <>
              <Link className="btn" href="/login">Sign in</Link>
              <Link className="btn btn--primary" href="/register">Start free</Link>
            </>
          )}
        </div>
      </header>

      <div className="site__body">{children}</div>

      <footer className="foot">
        <div className="wrap">
          <div className="foot__grid">
            <div className="foot__col" style={{ maxWidth: 280 }}>
              <Link href="/" className="mark" aria-label="Overtone" style={{ marginBottom: 12 }} />
              <p className="small muted" style={{ margin: 0 }}>
                Turn an earnings call into a cited, defensible research memo.
              </p>
            </div>
            <div className="foot__col">
              <h4>Product</h4>
              <Link href="/features">Features</Link>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
            <div className="foot__col">
              <h4>Company</h4>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
            <div className="foot__col">
              <h4>Account</h4>
              <Link href="/login">Sign in</Link>
              <Link href="/register">Create a workspace</Link>
            </div>
          </div>
          <p className="foot__note">
            Overtone hosts your own working copy of calls you capture. Transcripts are held
            per customer and are never pooled across workspaces.
          </p>
        </div>
      </footer>
    </div>
  );
}
