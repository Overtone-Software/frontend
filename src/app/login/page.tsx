'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { BackendStatus } from '@/components/BackendStatus';
import { api, ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(email.trim(), password);
      router.replace('/calls');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <div className="gate__card">
        <div className="gate__logo" role="img" aria-label="Overtone" />
        <p className="lede" style={{ textAlign: 'center' }}>
          Sign in to your research workspace.
        </p>
        <BackendStatus />
        {error && <div className="note note--bad">{error}</div>}
        <form onSubmit={submit} className="panel panel--pad" style={{ display: 'grid', gap: 10 }}>
          <input
            className="input"
            type="email"
            placeholder="you@fund.com"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="small muted" style={{ textAlign: 'center' }}>
          No account yet? <Link href="/register">Create one</Link>
        </p>
        <p className="small muted" style={{ textAlign: 'center', marginTop: -6 }}>
          Forgotten your password? Ask a workspace owner to reset it — self-serve reset
          needs an email sender, which is not configured yet.
        </p>
      </div>
    </div>
  );
}
