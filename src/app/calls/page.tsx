'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type Call, type UsageItem } from '@/lib/api';

function stamp(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[] | null>(null);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listCalls()
      .then((r) => setCalls(r.items))
      .catch((err) => {
        setCalls([]);
        setError(err instanceof ApiError ? err.message : 'Could not load your calls.');
      });
    api.usage().then((r) => setUsage(r.items)).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    if (!calls) return null;
    const q = query.trim().toLowerCase();
    if (!q) return calls;
    return calls.filter((c) => c.title.toLowerCase().includes(q));
  }, [calls, query]);

  const ready = calls?.filter((c) => c.status === 'ready').length ?? 0;
  const callQuota = usage.find((u) => u.kind === 'call_ingest');

  return (
    <Shell>
      <div className="page-head">
        <div className="page-head__text">
          <h1>Calls</h1>
          <p className="lede">
            Everything your workspace has captured. Open one to read the transcript, ask
            questions, or draft a memo.
          </p>
        </div>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="stat__label">Captured</div>
          <div className="stat__value mono">{calls?.length ?? '—'}</div>
          <div className="stat__sub">{ready} indexed and ready</div>
        </div>
        {callQuota && (
          <div className="card">
            <div className="stat__label">Calls this period</div>
            <div className="stat__value mono">
              {callQuota.used}
              <span className="muted" style={{ fontSize: 16 }}> / {callQuota.limit}</span>
            </div>
            <div className="meter">
              <div
                className="meter__fill"
                data-full={callQuota.remaining <= 0}
                style={{ width: `${Math.min(100, (callQuota.used / Math.max(1, callQuota.limit)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="Filter by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="spacer" />
        <span className="hint" style={{ marginTop: 0 }}>
          Capture a call from the browser extension.
        </span>
      </div>

      {filtered === null ? (
        <p className="empty"><span className="spin" /> Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="empty">
          {calls?.length
            ? 'No call matches that filter.'
            : 'No calls yet. Open an earnings call and capture it with the Overtone extension.'}
        </p>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Call</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 90 }}>Length</th>
                <th style={{ width: 110 }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((call) => (
                <tr key={call.id}>
                  <td>
                    <Link className="link-row" href={`/calls/${call.id}`}>
                      {call.title || 'Untitled call'}
                    </Link>
                    {call.status_detail && (
                      <div className="small muted">{call.status_detail}</div>
                    )}
                  </td>
                  <td><span className="badge" data-status={call.status}>{call.status}</span></td>
                  <td className="mono muted">{stamp(call.duration_seconds)}</td>
                  <td className="small">
                    {call.source_url ? (
                      <a href={call.source_url} target="_blank" rel="noreferrer">
                        {call.source_platform || 'open'}
                      </a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
