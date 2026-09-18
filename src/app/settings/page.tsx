'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { api, ApiError, type SessionInfo } from '@/lib/api';

const MIN_PASSWORD = 12;

export default function SettingsPage() {
  const router = useRouter();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.me().then(setInfo).catch(() => undefined);
  }, []);

  const tooShort = next.length > 0 && next.length < MIN_PASSWORD;
  const mismatch = confirm.length > 0 && confirm !== next;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (tooShort || mismatch) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const result = await api.changePassword(current, next);
      setDone(result.message);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change your password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <h1>Settings</h1>
          <p className="lede">Your account and workspace.</p>
        </div>
      </div>

      <h2>Account</h2>
      <div className="panel panel--pad">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted small">Name</span>
          <span>{info?.user.full_name || '—'}</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
          <span className="muted small">Email</span>
          <span>{info?.user.email ?? '—'}</span>
        </div>
      </div>

      <h2>Workspaces</h2>
      {info?.organizations.length ? (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {info.organizations.map((org) => (
                <tr key={org.id}>
                  <td>{org.name}</td>
                  <td>
                    <span className="tag">{org.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card muted small">No workspaces.</div>
      )}

      <h2>Change password</h2>
      {error && <div className="note note--bad">{error}</div>}
      {done && <div className="note note--good">{done}</div>}
      <form className="panel panel--pad" onSubmit={submit} style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="cur">Current password</label>
          <input
            id="cur"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="new">New password</label>
          <input
            id="new"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <div className="hint" style={{ color: tooShort ? 'var(--danger)' : undefined }}>
            At least {MIN_PASSWORD} characters.
          </div>
        </div>
        <div className="field">
          <label htmlFor="new2">Confirm new password</label>
          <input
            id="new2"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && <div className="hint" style={{ color: 'var(--danger)' }}>Passwords do not match.</div>}
        </div>
        <div className="row">
          <button className="btn btn--primary" type="submit" disabled={busy || tooShort || mismatch}>
            {busy ? 'Changing…' : 'Change password'}
          </button>
          <span className="hint" style={{ marginTop: 0 }}>
            Signs out your other sessions.
          </span>
        </div>
      </form>

      <h2>Sign out</h2>
      <div className="panel panel--pad">
        <button
          className="btn"
          onClick={() => {
            void api.logout().finally(() => router.replace('/login'));
          }}
        >
          Sign out of this browser
        </button>
      </div>
    </Shell>
  );
}
