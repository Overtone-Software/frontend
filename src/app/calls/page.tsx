'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type Call } from '@/lib/api';

function period(call: Call): string {
  return call.fiscal_year && call.fiscal_quarter
    ? `Q${call.fiscal_quarter} FY${call.fiscal_year}`
    : '—';
}

function duration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listCalls()
      .then((res) => setCalls(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load calls.'));
  }, []);

  return (
    <Shell>
      <h1>Calls</h1>
      <p className="lede">Everything your team has captured, newest first.</p>
      {error && <div className="banner banner--error">{error}</div>}

      {calls === null && !error && <div className="empty">Loading…</div>}

      {calls?.length === 0 && (
        <div className="card">
          <div className="empty">
            No calls yet. Open an earnings call in your browser and capture it with
            the Overtone extension.
          </div>
        </div>
      )}

      {calls && calls.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Call</th>
                <th>Period</th>
                <th>Length</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id}>
                  <td>
                    <a href={call.source_url} target="_blank" rel="noreferrer">
                      {call.title || 'Untitled call'}
                    </a>
                  </td>
                  <td>{period(call)}</td>
                  <td>{duration(call.duration_seconds)}</td>
                  <td>
                    <span className="badge" data-status={call.status}>
                      {call.status}
                    </span>
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
