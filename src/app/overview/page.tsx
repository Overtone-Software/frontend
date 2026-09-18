'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import {
  api,
  type Analysis,
  type Call,
  type SessionInfo,
  type UsageItem,
} from '@/lib/api';

const ALLOWANCE: Record<string, string> = {
  call_ingest: 'Calls indexed',
  chat_message: 'Questions asked',
  memo_generate: 'Memos drafted',
};

const TICKS = 24;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Segmented allowance meter.
 *
 * Ticks rather than a smooth bar: an analyst reads "nine of twenty-four lit" far
 * faster than a proportion, and it carries the waveform from the mark into the
 * interface without being decoration.
 */
function Ticks({ used, limit }: { used: number; limit: number }) {
  const ratio = limit > 0 ? used / limit : 0;
  const lit = Math.min(TICKS, Math.round(ratio * TICKS));
  const over = ratio >= 1;
  return (
    <div className="ticks" role="img" aria-label={`${used} of ${limit} used`}>
      {Array.from({ length: TICKS }, (_, i) => (
        <span key={i} className="tick" data-on={i < lit} data-over={over && i < lit} />
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [calls, setCalls] = useState<Call[] | null>(null);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [plan, setPlan] = useState('');
  const [signals, setSignals] = useState<Analysis | null>(null);

  useEffect(() => {
    api.me().then(setInfo).catch(() => undefined);
    api.usage().then((r) => { setUsage(r.items); setPlan(r.plan); }).catch(() => undefined);
    api
      .listCalls()
      .then((r) => {
        setCalls(r.items);
        const latest = r.items[0];
        // Only the newest call's signals are shown, so only those are fetched.
        if (latest) api.getAnalysis(latest.id).then(setSignals).catch(() => undefined);
      })
      .catch(() => setCalls([]));
  }, []);

  const latest = calls?.[0] ?? null;
  const ready = calls?.filter((c) => c.status === 'ready').length ?? 0;
  const org = info?.organizations.find((o) => o.id === info.active_organization_id)
    ?? info?.organizations[0];
  const firstName = (info?.user.full_name ?? '').trim().split(' ')[0];

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <h1>{greeting()}{firstName ? `, ${firstName}` : ''}</h1>
          <p className="lede">
            {calls === null
              ? 'Loading your workspace…'
              : calls.length === 0
                ? 'Nothing captured yet. Open an earnings call and press the camera button in the player.'
                : `${calls.length} call${calls.length === 1 ? '' : 's'} in ${org?.name ?? 'your workspace'}, ${ready} indexed and ready to question.`}
          </p>
        </div>
      </div>

      {latest ? (
        <section className="hero">
          <div className="row">
            <span className="hero__label">Most recent call</span>
            <span className="tag" data-status={latest.status}>{latest.status}</span>
          </div>
          <h2 className="hero__title" style={{ margin: '6px 0 0' }}>
            {latest.title || 'Untitled call'}
          </h2>

          {signals ? (
            <div className="hero__readout">
              <div className="hero__stat">
                <b className="num">{signals.tone.hedge_rate.toFixed(1)}</b>
                <span>hedges per 1,000 words</span>
              </div>
              <div className="hero__stat">
                <b className="num">
                  {signals.tone.net_confidence > 0 ? '+' : ''}
                  {signals.tone.net_confidence.toFixed(1)}
                </b>
                <span>net confidence</span>
              </div>
              <div className="hero__stat">
                <b className="num">{signals.dodges.length}</b>
                <span>questions left unanswered</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--on-deep-dim)', fontSize: 14, margin: '14px 0 20px', maxWidth: '54ch' }}>
              {latest.status === 'ready'
                ? 'No signals read yet. Run the analysis to see how management hedged and which questions went unanswered.'
                : 'Signals appear once the transcript finishes indexing.'}
            </p>
          )}

          <div className="row">
            <Link className="btn btn--primary" href={`/calls/${latest.id}`}>Open call</Link>
            <Link className="btn btn--onink" href={`/calls/${latest.id}`}>Ask a question</Link>
            {latest.source_url && (
              <a className="btn btn--onink" href={latest.source_url} target="_blank" rel="noreferrer">
                Watch source
              </a>
            )}
          </div>
        </section>
      ) : calls !== null ? (
        <section className="hero">
          <span className="hero__label">Getting started</span>
          <h2 className="hero__title">Capture your first call</h2>
          <p style={{ color: 'var(--on-deep-dim)', fontSize: 14, margin: '12px 0 20px', maxWidth: '56ch' }}>
            Open an earnings call on YouTube or a supported IR webcast, then press the
            camera button in the player controls. Overtone indexes the transcript and
            everything here fills in.
          </p>
          <Link className="btn btn--onink" href="/calls">See supported venues</Link>
        </section>
      ) : null}

      <h2>This month</h2>
      <div className="panel panel--pad">
        {usage.length === 0 ? (
          <p className="dim small" style={{ margin: 0 }}>Loading your allowance…</p>
        ) : (
          <div className="allow">
            {usage.map((item) => (
              <div className="allow__row" key={item.kind}>
                <span className="allow__name">{ALLOWANCE[item.kind] ?? item.kind}</span>
                <Ticks used={item.used} limit={item.limit} />
                <span className="allow__count num">
                  {item.used} of {item.limit}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="hint" style={{ marginTop: 14 }}>
          You are on the {plan || '—'} plan. <Link href="/pricing">Paid plans are coming</Link>
        </p>
      </div>

      <h2>Recent calls</h2>
      <div className="panel">
        {calls === null ? (
          <p className="blank"><span className="spin" /> Loading</p>
        ) : calls.length === 0 ? (
          <p className="blank">Captured calls will appear here.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Call</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 110 }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {calls.slice(0, 5).map((call) => (
                <tr key={call.id}>
                  <td>
                    <Link className="row-link" href={`/calls/${call.id}`}>
                      {call.title || 'Untitled call'}
                    </Link>
                  </td>
                  <td><span className="tag" data-status={call.status}>{call.status}</span></td>
                  <td className="small">
                    {call.source_url ? (
                      <a href={call.source_url} target="_blank" rel="noreferrer">
                        {call.source_platform || 'open'}
                      </a>
                    ) : (
                      <span className="dim">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2>Account and workspace</h2>
      <div className="panel">
        <div className="facts">
          <div className="fact">
            <div className="fact__k">Name</div>
            <div className="fact__v">{info?.user.full_name || '—'}</div>
          </div>
          <div className="fact">
            <div className="fact__k">Email</div>
            <div className="fact__v">{info?.user.email ?? '—'}</div>
          </div>
          <div className="fact">
            <div className="fact__k">Workspace</div>
            <div className="fact__v">{org?.name ?? '—'}</div>
          </div>
          <div className="fact">
            <div className="fact__k">Your role</div>
            <div className="fact__v" style={{ textTransform: 'capitalize' }}>{org?.role ?? '—'}</div>
          </div>
          <div className="fact">
            <div className="fact__k">Plan</div>
            <div className="fact__v" style={{ textTransform: 'capitalize' }}>{plan || '—'}</div>
          </div>
          <div className="fact">
            <div className="fact__k">Password</div>
            <div className="fact__v"><Link href="/settings">Change password</Link></div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
