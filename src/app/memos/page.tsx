'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type Memo } from '@/lib/api';

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listMemos()
      .then((r) => {
        setMemos(r.items);
        setOpen(r.items[0]?.id ?? null);
      })
      .catch((err) => {
        setMemos([]);
        setError(err instanceof ApiError ? err.message : 'Could not load your memos.');
      });
  }, []);

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <h1>Memos</h1>
          <p className="lede">
            Drafted from the transcript, with every claim traced to the moment it was said.
          </p>
        </div>
      </div>

      {error && <div className="note note--bad">{error}</div>}

      {memos === null ? (
        <p className="blank"><span className="spin" /> Loading…</p>
      ) : memos.length === 0 ? (
        <p className="blank">
          No memos yet. Open a call and draft one from its Memo tab.
        </p>
      ) : (
        memos.map((memo) => (
          <div className="panel panel--pad" key={memo.id}>
            <div className="row">
              <button
                className="tab"
                style={{ padding: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}
                aria-expanded={open === memo.id}
                onClick={() => setOpen(open === memo.id ? null : memo.id)}
              >
                {open === memo.id ? '▾' : '▸'} {memo.title || 'Untitled memo'}
              </button>
              <span className="spacer" />
              <span className="tag">{memo.status}</span>
              <Link className="small" href={`/calls/${memo.call_id}`}>Open call</Link>
            </div>

            {open === memo.id && (
              <>
                <div className="prose" style={{ marginTop: 12 }}>{memo.body_md}</div>
                {memo.citations?.length > 0 && (
                  <div className="cites">
                    {memo.citations.map((c) => (
                      <span className="cite" key={c.chunk_id ?? c.n} title={c.speakers}>
                        [{c.n}] {c.timestamp}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </Shell>
  );
}
