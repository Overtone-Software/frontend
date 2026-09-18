'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { BackendStatus } from '@/components/BackendStatus';
import { api, ApiError } from '@/lib/api';

/** Minimum the API will accept; stated up front rather than after a failed submit. */
const MIN_PASSWORD = 12;

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;
  const mismatch = confirm.length > 0 && confirm !== password;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (tooShort || mismatch) return;
    setBusy(true);
    setError(null);
    try {
      await api.signup({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        organization_name: org.trim() || `${fullName.trim() || 'My'} Research`,
      });
      router.replace('/overview');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create that account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <div className="gate__card">
        <Link href="/" className="gate__logo" aria-label="Overtone — home" />
        <h1 style={{ textAlign: 'center', fontSize: 22 }}>Create your workspace</h1>
        <p className="lede" style={{ textAlign: 'center' }}>
          Your transcripts and notes stay inside it. Nothing is pooled with other funds.
        </p>
        <BackendStatus />
        {error && <div className="note note--bad">{error}</div>}
        <form onSubmit={submit} className="panel panel--pad">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              className="input"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="org">Workspace name</label>
            <input
              id="org"
              className="input"
              placeholder="Your fund or team"
              autoComplete="organization"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
            />
            <div className="hint">Leave blank and we&apos;ll name it after you.</div>
          </div>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              className="input"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="hint" style={{ color: tooShort ? 'var(--danger)' : undefined }}>
              At least {MIN_PASSWORD} characters.
            </div>
          </div>
          <div className="field">
            <label htmlFor="pw2">Confirm password</label>
            <input
              id="pw2"
              className="input"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {mismatch && <div className="hint" style={{ color: 'var(--danger)' }}>Passwords do not match.</div>}
          </div>
          <button
            className="btn btn--primary"
            type="submit"
            style={{ width: '100%' }}
            disabled={busy || tooShort || mismatch}
          >
            {busy ? 'Creating…' : 'Create workspace'}
          </button>
        </form>
        <p className="small muted" style={{ textAlign: 'center' }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
