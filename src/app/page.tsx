import Link from 'next/link';
import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Overtone — earnings call research you can defend',
  description:
    'Capture an earnings call, ask questions about it, and get answers cited to the exact moment management said it.',
};

const VENUES = ['YouTube', 'Q4 Inc', 'Q4 Web', 'Notified', 'Chorus Call', 'Veracast'];

export default function Home() {
  return (
    <Site>
      <section className="section">
        <div className="wrap hero">
          <div>
            <p className="eyebrow">For analysts who have to show their work</p>
            <h1 className="display">Every answer points at the second it was said.</h1>
            <p className="subhead">
              Overtone captures the earnings call you are already listening to, indexes it,
              and answers questions about it. No claim survives without a citation that
              resolves to a timestamp you can click and hear.
            </p>
            <div className="row">
              <Link className="btn btn--primary btn--lg" href="/register">Start free</Link>
              <Link className="btn btn--lg" href="/how-it-works">See how it works</Link>
            </div>
            <p className="hint" style={{ marginTop: 16 }}>
              No card. Works on YouTube and the major IR webcast platforms.
            </p>
          </div>

          <div className="proof" aria-label="Example of a cited answer">
            <p className="proof__label">Answer</p>
            <p className="proof__claim">
              Gross margin expanded 180 basis points year over year to 42.1 percent, and
              management raised full-year revenue guidance to $4.2–4.3bn.
              <span className="proof__n">1</span>
              <span className="proof__n">2</span>
            </p>
            <div className="proof__rule" />
            <div className="proof__src">
              <span className="proof__time">1 · 12:04</span>
              <span className="proof__quote">
                &ldquo;Gross margin expanded 180 basis points year over year to 42.1 percent.&rdquo;
              </span>
            </div>
            <p className="proof__who">Jane Doe, Chief Financial Officer · prepared remarks</p>
            <div className="proof__rule" style={{ margin: '18px 0' }} />
            <div className="proof__src">
              <span className="proof__time">2 · 31:47</span>
              <span className="proof__quote">
                &ldquo;We are raising full-year revenue to a range of 4.2 to 4.3 billion dollars.&rdquo;
              </span>
            </div>
            <p className="proof__who">Jane Doe, Chief Financial Officer · Q&amp;A</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>A summariser gives you prose. You need evidence.</h2>
          <p className="section__lede">
            Anything can produce a paragraph about a call. The hard part is being able to
            stand behind it in an investment committee when someone asks where a number
            came from.
          </p>
          <div className="cards">
            <div className="card2">
              <h3>Citations are enforced in code</h3>
              <p>
                Citation markers the model invents are stripped before anything is saved.
                A numeric claim with no resolving source is reported to you rather than
                quietly kept.
              </p>
            </div>
            <div className="card2">
              <h3>Hedging, measured with the evidence</h3>
              <p>
                An occurrence rate per 1,000 words of management speech, shown next to the
                exact phrases that produced the number — so you can disagree with it.
              </p>
            </div>
            <div className="card2">
              <h3>Questions that never got answered</h3>
              <p>
                Detected from explicit deflection, low overlap between question and answer,
                and a requested figure that never arrived.
              </p>
            </div>
            <div className="card2">
              <h3>What changed since last quarter</h3>
              <p>
                The phrases management started and stopped using. Posture shifts show up in
                word choice long before they show up in a press release.
              </p>
            </div>
            <div className="card2">
              <h3>Prepared remarks and Q&amp;A, separated</h3>
              <p>
                Parsed from the operator&apos;s script, with speakers attributed. &ldquo;The CFO
                said&rdquo; is a different fact from &ldquo;an analyst asked&rdquo;.
              </p>
            </div>
            <div className="card2">
              <h3>Your archive stays yours</h3>
              <p>
                Transcripts are held per customer and never pooled. The extension asks for
                access to call venues only — no browsing history, no other tabs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Three steps, during the call</h2>
          <p className="section__lede">
            Capture has to survive your attention being elsewhere, because it usually is.
          </p>
          <div className="steps">
            <div className="step">
              <h3>Capture</h3>
              <p>
                Open the call and press the camera button in the player&apos;s own controls —
                it works in fullscreen. Overtone reads the published transcript and indexes it.
              </p>
            </div>
            <div className="step">
              <h3>Ask</h3>
              <p>
                Question the call in plain language while it is still running. Every answer
                arrives with citations you can click back to the recording.
              </p>
            </div>
            <div className="step">
              <h3>Compare</h3>
              <p>
                Once you have two quarters of a name, Overtone shows what management started
                saying, stopped saying, and how the hedging moved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Where it works</h2>
          <p className="section__lede">
            The venues that carry the overwhelming majority of public company calls. A
            handful of webcast platforms serve thousands of issuers between them.
          </p>
          <div className="venues">
            {VENUES.map((venue) => (
              <span className="venue" key={venue}>{venue}</span>
            ))}
          </div>
          <p className="hint" style={{ marginTop: 18 }}>
            Capture needs the venue to publish a transcript or captions. Where one exists,
            Overtone indexes it; where it does not, notes and slide capture still work.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="band">
            <h2>Try it on the next call you listen to</h2>
            <p>
              Create a workspace, install the extension, and capture a call. Everything is
              open while pricing is being worked out — there is nothing to pay and no card
              to enter.
            </p>
            <div className="row">
              <Link className="btn btn--primary btn--lg" href="/register">Create a workspace</Link>
              <Link className="btn btn--onink btn--lg" href="/contact">Talk to us first</Link>
            </div>
          </div>
        </div>
      </section>
    </Site>
  );
}
