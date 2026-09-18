import Link from 'next/link';
import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'How it works — Overtone',
  description: 'From opening a call to a cited answer, and what happens at each step.',
};

const FAQ = [
  ['Do I have to upload anything?',
   'No. Overtone reads the transcript the venue already publishes on the page you are watching, when you press capture.'],
  ['What if the call has no transcript?',
   'Indexing needs one, so questions and signals will not be available. Timestamped notes and slide capture still work, and you can come back once a transcript is posted.'],
  ['Can I use it on videos that are not earnings calls?',
   'Yes. Overtone works on any supported page. It notices when a recording is not a company call and produces cited notes instead of an earnings memo, rather than inventing sections that were never discussed.'],
  ['Where is my data stored?',
   'In your own workspace. Transcripts are held per customer and never pooled across workspaces. The privacy policy sets out exactly what is collected.'],
  ['What does the extension get access to?',
   'The call venues listed on the home page, plus Overtone’s own API. It does not request access to all sites and cannot see any other tab.'],
  ['Does it work in fullscreen?',
   'Yes — the capture button sits inside the player’s own controls, which is exactly when you are most likely to want a slide.'],
];

export default function HowItWorksPage() {
  return (
    <Site>
      <section className="section section--tight hero-stage">
        <div className="wrap">
          <p className="eyebrow">How it works</p>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', maxWidth: '18ch' }}>
            From a live call to something you can send.
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="steps">
            <div className="step">
              <h3>Install and sign in</h3>
              <p>
                Create a workspace, then load the extension. It stays dormant until you
                open a call on a supported venue.
              </p>
            </div>
            <div className="step">
              <h3>Capture the call</h3>
              <p>
                The panel appears beside the player. Press capture: Overtone reads the
                published transcript, separates prepared remarks from Q&amp;A, attributes
                speakers and indexes the whole thing.
              </p>
            </div>
            <div className="step">
              <h3>Ask while it runs</h3>
              <p>
                Question the call in plain language. Answers stream back with citations that
                resolve to a timestamp, a speaker and the quote behind the claim.
              </p>
            </div>
            <div className="step">
              <h3>Capture what you see</h3>
              <p>
                Grab a guidance slide from the player controls, or stamp a note at the
                current moment. Both are stored against the call and survive a reload.
              </p>
            </div>
            <div className="step">
              <h3>Read the signals</h3>
              <p>
                Hedging rate with the phrases behind it, and the questions that were asked
                but never answered.
              </p>
            </div>
            <div className="step">
              <h3>Compare quarters</h3>
              <p>
                With two calls from one name, Overtone shows what changed in management&apos;s
                language since last time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap wrap--narrow" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <h2>Questions people ask first</h2>
          <div style={{ marginTop: 24 }}>
            {FAQ.map(([q, a]) => (
              <div className="faq" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="band">
            <h2>Ready when the next call is</h2>
            <p>Setting up takes a couple of minutes and costs nothing.</p>
            <Link className="btn btn--primary btn--lg" href="/register">Create a workspace</Link>
          </div>
        </div>
      </section>
    </Site>
  );
}
