'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type Memo } from '@/lib/api';

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[] | null>(null);
  const [open, setOpen] = useState<Memo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listMemos()
      .then((res) => setMemos(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load memos.'));
  }, []);

  if (open) {
    return (
      <Shell>
        <button className="btn" onClick={() => setOpen(null)} style={{ marginBottom: 16 }}>
          ← Back to memos
        </button>
        <h1>{open.title}</h1>
        <p className="lede">
          {open.citations.length} citation{open.citations.length === 1 ? '' : 's'} · every claim
          resolves to a timestamp in the recording.
        </p>
        <div className="card memo">{open.body_md}</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1>Memos</h1>
      <p className="lede">Drafted from a call, with a source table you can check line by line.</p>
      {error && <div className="banner banner--error">{error}</div>}

      {memos === null && !error && <div className="empty">Loading…</div>}
      {memos?.length === 0 && (
        <div className="card">
          <div className="empty">
            No memos yet. Capture a call, then draft one from the extension.
          </div>
        </div>
      )}

      {memos?.map((memo) => (
        <button
          key={memo.id}
          className="card"
          onClick={() => setOpen(memo)}
          style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <strong>{memo.title}</strong>
          <div className="stat__sub" style={{ marginTop: 4 }}>
            {memo.citations.length} citations · {memo.status}
          </div>
        </button>
      ))}
    </Shell>
  );
}
