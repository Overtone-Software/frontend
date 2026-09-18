'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type CoverageItem } from '@/lib/api';

export default function CoveragePage() {
  const [items, setItems] = useState<CoverageItem[] | null>(null);
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .listCoverage()
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));

  useEffect(() => {
    void load();
  }, []);

  async function add(event: FormEvent) {
    event.preventDefault();
    const symbol = ticker.trim();
    if (!symbol) return;
    setBusy(true);
    setError(null);
    try {
      await api.addCoverage(symbol, name.trim());
      setTicker('');
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add that name.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <h1>Coverage</h1>
          <p className="lede">
            The names you follow. Calls you capture are grouped by ticker, which is what
            makes quarter-over-quarter comparison possible.
          </p>
        </div>
      </div>

      {error && <div className="note note--bad">{error}</div>}

      <form className="row" onSubmit={add} style={{ marginBottom: 18 }}>
        <input
          className="input"
          style={{ maxWidth: 140 }}
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
        />
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Company name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn--primary" type="submit" disabled={busy || !ticker.trim()}>
          {busy ? 'Adding…' : 'Add to coverage'}
        </button>
      </form>

      {items === null ? (
        <p className="blank"><span className="spin" /> Loading</p>
      ) : items.length === 0 ? (
        <p className="blank">
          No names yet. Add a ticker above, then capture that company&apos;s calls — the
          archive is what the quarter-over-quarter diff reads from.
        </p>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th style={{ width: 90 }}>Ticker</th>
                <th>Company</th>
                <th style={{ width: 130 }}>Calls indexed</th>
                <th style={{ width: 90 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.ticker}</strong></td>
                  <td>{item.company_name || '—'}</td>
                  <td className="num">
                    {item.calls_indexed > 0 ? (
                      <Link href="/calls">{item.calls_indexed}</Link>
                    ) : (
                      <span className="dim">none yet</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="cite"
                      onClick={() => {
                        void api.removeCoverage(item.id).then(load).catch(() => undefined);
                      }}
                    >
                      Remove
                    </button>
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
