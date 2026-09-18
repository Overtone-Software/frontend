'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type Evidence, type Thesis } from '@/lib/api';

function stamp(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function ThesesPage() {
  const [items, setItems] = useState<Thesis[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Record<string, Evidence[]>>({});
  const [name, setName] = useState('');
  const [statement, setStatement] = useState('');
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .listTheses()
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!open || evidence[open]) return;
    api
      .thesisEvidence(open)
      .then((r) => setEvidence((prev) => ({ ...prev, [open]: r.items })))
      .catch(() => undefined);
  }, [open, evidence]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.createThesis({
        name: name.trim(),
        statement: statement.trim(),
        ticker: ticker.trim(),
      });
      setName('');
      setStatement('');
      setTicker('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save that thesis.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <h1>Theses</h1>
          <p className="lede">
            What you believe about a name, and the evidence for it. Notes you tag while
            listening accumulate here across quarters.
          </p>
        </div>
      </div>

      {error && <div className="note note--bad">{error}</div>}

      <form className="panel panel--pad" onSubmit={create} style={{ marginBottom: 18 }}>
        <div className="field">
          <label htmlFor="tname">Thesis</label>
          <input
            id="tname"
            className="input"
            placeholder="Margin expansion is structural, not cyclical"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="tstate">What would prove it</label>
          <input
            id="tstate"
            className="input"
            placeholder="Mix, not price, drives the gain — and it holds through a down quarter"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
        </div>
        <div className="row">
          <input
            className="input"
            style={{ maxWidth: 140 }}
            placeholder="Ticker (optional)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
          />
          <button className="btn btn--primary" type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Saving…' : 'Add thesis'}
          </button>
        </div>
      </form>

      {items === null ? (
        <p className="blank"><span className="spin" /> Loading</p>
      ) : items.length === 0 ? (
        <p className="blank">
          No theses yet. Write one above, then tag notes to it from the call page as you
          listen.
        </p>
      ) : (
        items.map((thesis) => (
          <div className="panel panel--pad" key={thesis.id} style={{ marginBottom: 12 }}>
            <div className="row">
              <button
                className="tab"
                style={{ padding: 0, borderBottom: 0, color: 'var(--ink)', fontWeight: 650 }}
                aria-expanded={open === thesis.id}
                onClick={() => setOpen(open === thesis.id ? null : thesis.id)}
              >
                {open === thesis.id ? '▾' : '▸'} {thesis.name}
              </button>
              <span className="spacer" />
              <span className="tag">{thesis.evidence_count} note{thesis.evidence_count === 1 ? '' : 's'}</span>
              <span className="tag">{thesis.is_open ? 'open' : 'closed'}</span>
              <button
                className="cite"
                onClick={() => {
                  void api
                    .updateThesis(thesis.id, { is_open: !thesis.is_open })
                    .then(load)
                    .catch(() => undefined);
                }}
              >
                {thesis.is_open ? 'Close' : 'Reopen'}
              </button>
            </div>

            {thesis.statement && (
              <p className="muted small" style={{ margin: '8px 0 0' }}>{thesis.statement}</p>
            )}

            {open === thesis.id && (
              <div style={{ marginTop: 12 }}>
                {(evidence[thesis.id] ?? []).length === 0 ? (
                  <p className="dim small" style={{ margin: 0 }}>
                    No evidence tagged yet. On a call page, save a note against this thesis.
                  </p>
                ) : (
                  <table>
                    <tbody>
                      {(evidence[thesis.id] ?? []).map((item) => (
                        <tr key={item.note_id}>
                          <td style={{ width: 90 }} className="num">
                            <a href={`${item.source_url}&t=${Math.floor(item.timestamp_s)}s`} target="_blank" rel="noreferrer">
                              {stamp(item.timestamp_s)}
                            </a>
                          </td>
                          <td>
                            {item.body}
                            <div className="dim small">
                              <Link href={`/calls/${item.call_id}`}>{item.call_title || 'call'}</Link>
                              {item.period && item.period !== 'unknown period' && ` · ${item.period}`}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </Shell>
  );
}
