'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function PricingPage() {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    api.usage().then((r) => setPlan(r.plan)).catch(() => setPlan(''));
  }, []);

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <h1>Plans</h1>
          <p className="lede">
            Paid plans are not open yet. Everything is running on the free plan while we
            finish pricing, so nothing is gated and nothing needs a card.
          </p>
        </div>
      </div>

      <section className="hero">
        <span className="hero__label">Coming soon</span>
        <h2 className="hero__title">Pricing is still being worked out</h2>
        <p style={{ color: '#9aa5c8', fontSize: 14, margin: '12px 0 22px', maxWidth: '58ch' }}>
          When plans open, the things that compound with your archive — search across every
          call you have captured, and quarter-over-quarter language diffs — are what will
          separate the tiers. Until then you have the full workflow on the free plan.
        </p>
        <div className="row">
          <Link className="btn btn--onink" href="/usage">See what you have used</Link>
          <Link className="btn btn--onink" href="/calls">Back to calls</Link>
        </div>
      </section>

      <h2>Your plan today</h2>
      <div className="panel">
        <div className="facts">
          <div className="fact">
            <div className="fact__k">Current plan</div>
            <div className="fact__v" style={{ textTransform: 'capitalize' }}>
              {plan === null ? 'Loading…' : plan || '—'}
            </div>
          </div>
          <div className="fact">
            <div className="fact__k">Cost</div>
            <div className="fact__v">Free</div>
          </div>
          <div className="fact">
            <div className="fact__k">Allowance</div>
            <div className="fact__v"><Link href="/usage">Usage this month</Link></div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
