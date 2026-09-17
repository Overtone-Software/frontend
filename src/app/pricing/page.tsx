'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api, type Plan } from '@/lib/api';

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    api.plans().then(setPlans).catch(() => setPlans([]));
  }, []);

  return (
    <Shell>
      <h1>Plans</h1>
      <p className="lede">
        Cross-call search and quarter-over-quarter analysis are what compound with your
        archive — they are the reason to move up a tier.
      </p>

      <div className="grid">
        {plans?.map((plan) => (
          <div className="card" key={plan.slug}>
            <div className="stat__label">{plan.name}</div>
            <div className="stat__value">
              ${Number(plan.monthly_price_usd)}
              <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 400 }}>/mo</span>
            </div>
            <p className="stat__sub" style={{ minHeight: 34 }}>{plan.description}</p>
            <ul style={{ paddingLeft: 18, margin: '8px 0 0', fontSize: 13, color: 'var(--muted)' }}>
              <li>{plan.monthly_calls} calls / month</li>
              <li>{plan.monthly_chat_messages} questions</li>
              <li>{plan.monthly_memos} memos</li>
              <li>{plan.max_seats} seat{plan.max_seats === 1 ? '' : 's'}</li>
              <li>{plan.cross_call_search ? '✓' : '—'} Cross-call search</li>
              <li>{plan.qoq_analysis ? '✓' : '—'} Quarter-over-quarter</li>
              <li>{plan.sso_enabled ? '✓' : '—'} SSO</li>
            </ul>
          </div>
        ))}
      </div>
    </Shell>
  );
}
