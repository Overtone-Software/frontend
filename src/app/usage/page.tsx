'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, ApiError, type UsageItem } from '@/lib/api';

const LABELS: Record<string, string> = {
  call_ingest: 'Calls indexed',
  chat_message: 'Questions asked',
  memo_generate: 'Memos drafted',
};

export default function UsagePage() {
  const [plan, setPlan] = useState<string>('');
  const [items, setItems] = useState<UsageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .usage()
      .then((res) => {
        setPlan(res.plan);
        setItems(res.items);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load usage.'));
  }, []);

  return (
    <Shell>
      <h1>Usage</h1>
      <p className="lede">
        Rolling 30-day window{plan && ` · ${plan} plan`}. Counted from an append-only
        ledger, so every number here is auditable.
      </p>
      {error && <div className="banner banner--error">{error}</div>}

      <div className="grid">
        {items?.map((item) => {
          const pct = item.limit > 0 ? Math.min(100, (item.used / item.limit) * 100) : 0;
          return (
            <div className="card" key={item.kind}>
              <div className="stat__label">{LABELS[item.kind] ?? item.kind}</div>
              <div className="stat__value">
                {item.used}
                <span style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 400 }}>
                  {' '}/ {item.limit}
                </span>
              </div>
              <div className="stat__sub">{item.remaining} remaining</div>
              <div className="meter">
                <div className="meter__fill" style={{ width: `${pct}%` }} data-full={pct >= 100} />
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
