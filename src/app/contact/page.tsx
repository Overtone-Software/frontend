import Link from 'next/link';
import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Contact — Overtone',
  description: 'Talk to the people building Overtone.',
};

const EMAIL = 'etisamhaq24@gmail.com';

/**
 * Deliberately not a contact form.
 *
 * There is no transactional email sender wired up, so a form would collect a message
 * and drop it. A mailto link is less fashionable and actually delivers, which matters
 * more on the page where someone is trying to reach a human.
 */
export default function ContactPage() {
  return (
    <Site>
      <section className="section section--tight">
        <div className="wrap">
          <p className="eyebrow">Contact</p>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.4vw, 46px)', maxWidth: '18ch' }}>
            Tell us what you cover.
          </h1>
          <p className="subhead">
            We are most useful to analysts who follow the same names quarter after quarter.
            If that is you, we want to hear which venues you listen on and what your
            workflow looks like today.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cards">
            <div className="card2">
              <h3>Product and sales</h3>
              <p style={{ marginBottom: 12 }}>
                Questions about whether Overtone fits your process, or a venue you need
                covered that is not on the list yet.
              </p>
              <a className="btn" href={`mailto:${EMAIL}?subject=Overtone%20enquiry`}>
                Email us
              </a>
            </div>
            <div className="card2">
              <h3>Something is broken</h3>
              <p style={{ marginBottom: 12 }}>
                Send the call URL and roughly when it happened. Every response carries a
                request id, which is how we tie your report to the exact trace.
              </p>
              <a className="btn" href={`mailto:${EMAIL}?subject=Overtone%20bug%20report`}>
                Report a problem
              </a>
            </div>
            <div className="card2">
              <h3>Privacy and data</h3>
              <p style={{ marginBottom: 12 }}>
                Deletion requests, questions about what is stored, or anything covered in
                the privacy policy.
              </p>
              <Link className="btn" href="/privacy">Read the policy</Link>
            </div>
          </div>

          <p className="hint" style={{ marginTop: 26 }}>
            Email reaches a person, not a queue. We answer within a working day.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="band">
            <h2>Or just try it</h2>
            <p>
              A workspace takes a minute to create and there is nothing to pay. It is
              usually a faster answer than a conversation.
            </p>
            <Link className="btn btn--primary btn--lg" href="/register">Start free</Link>
          </div>
        </div>
      </section>
    </Site>
  );
}
