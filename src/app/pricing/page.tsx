import Link from 'next/link';
import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Pricing — Overtone',
  description: 'Overtone is free while pricing is being worked out. Nothing is gated.',
};

const INCLUDED = [
  'Capture and index calls from every supported venue',
  'Cited answers with timestamps you can click',
  'Slide capture and timestamped notes',
  'Hedging rate, unanswered questions and net confidence',
  'Quarter-over-quarter language diffs',
  'Search across every call from a company',
  'Coverage lists and theses with accumulated evidence',
];

export default function PricingPage() {
  return (
    <Site>
      <section className="section section--tight">
        <div className="wrap">
          <p className="eyebrow">Pricing</p>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', maxWidth: '19ch' }}>
            Free while we work out what it should cost.
          </h1>
          <p className="subhead">
            Nothing is gated and there is no card to enter. We would rather find out what
            analysts actually use before deciding what to charge for.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="hero">
            <div>
              <h2>What you get today</h2>
              <p className="section__lede">
                The whole product. Every feature below is open on the free plan right now.
              </p>
              <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--slate)', lineHeight: 2 }}>
                {INCLUDED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="proof">
              <p className="proof__label">Current plan</p>
              <p style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                Free
              </p>
              <p style={{ color: '#9aa5c8', fontSize: 14.5, margin: '0 0 22px', lineHeight: 1.6 }}>
                Generous limits, every feature, no card. We will give plenty of notice
                before anything changes, and you will never lose access to research you
                have already captured.
              </p>
              <Link className="btn btn--primary btn--lg" href="/register" style={{ width: '100%', textAlign: 'center' }}>
                Create a workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap wrap--narrow" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <h2>When pricing does arrive</h2>
          <div className="faq">
            <h3>What will separate the tiers?</h3>
            <p>
              The things that compound with an archive rather than working on a single
              call — searching across every quarter of a name, and quarter-over-quarter
              language diffs. Capturing and questioning one call will stay within reach.
            </p>
          </div>
          <div className="faq">
            <h3>Will I lose what I have captured?</h3>
            <p>
              No. Research already in your workspace stays there and stays readable,
              whatever you choose to do when plans open.
            </p>
          </div>
          <div className="faq">
            <h3>Will you tell me before it changes?</h3>
            <p>
              Yes, well in advance and by email. Nothing will start charging quietly.
            </p>
          </div>
        </div>
      </section>
    </Site>
  );
}
