import Link from 'next/link';
import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Features — Overtone',
  description:
    'Cited answers, hedging measurement, dodge detection, quarter-over-quarter language diffs, slide capture and timestamped notes.',
};

const GROUPS = [
  {
    title: 'Capture',
    lede: 'Everything that has to happen while you are listening, without taking your attention.',
    items: [
      ['Slide capture from the player', 'A camera button sits among the venue’s own controls, so it works in fullscreen. Each capture is stamped with the exact playback position and stored against the call.'],
      ['Timestamped notes', 'One keystroke stamps the current moment. Notes stay in call order and click back to the recording.'],
      ['Transcript indexing', 'Overtone reads the transcript the venue publishes, separates prepared remarks from Q&A, and attributes speakers.'],
      ['Nothing is captured silently', 'Indexing happens when you ask for it. Opening a page does not spend your allowance or index anything.'],
    ],
  },
  {
    title: 'Question',
    lede: 'The part that has to be defensible.',
    items: [
      ['Answers with resolving citations', 'Every claim carries a marker that resolves to a timestamp, a speaker and the quote it came from.'],
      ['Invented citations are stripped', 'Markers the model produces that do not resolve to a retrieved source are removed before anything is stored.'],
      ['Unsupported claims are surfaced', 'A numeric claim with no source is shown to you as unsupported rather than quietly kept or silently deleted.'],
      ['Hybrid retrieval', 'Semantic search catches the paraphrase; full-text catches the rare exact terms that decide a call — “350 basis points”, “Section 232”.'],
      ['Search across an archive', 'Ask a question across every call you have captured for a company, not just the one on screen.'],
    ],
  },
  {
    title: 'Read the signals',
    lede: 'What management’s language says that the numbers do not.',
    items: [
      ['Hedging rate', 'Occurrences per 1,000 words of management speech, so a long call is not automatically a hedged one. Shown with the phrases behind it.'],
      ['Unanswered questions', 'Flagged from three independent signals: explicit deflection, low topical overlap between question and answer, and a requested quantity that never arrives.'],
      ['Quarter-over-quarter diff', 'The phrases they started and stopped using, and how confidence and hedging moved against the previous call.'],
      ['Net confidence', 'Confident language minus negative language, measured the same way each quarter so the trend is comparable.'],
    ],
  },
  {
    title: 'Work the archive',
    lede: 'The part that compounds. One call is a note; twenty quarters is an edge.',
    items: [
      ['Coverage list', 'The names you follow. Calls group by ticker, which is what makes quarter-over-quarter possible.'],
      ['Theses with evidence', 'Write what you believe, then tag notes to it as you listen. Evidence accumulates across quarters in one place.'],
      ['Automatic call identification', 'Ticker, fiscal quarter and year are read from the title on capture, and you can correct any of it.'],
      ['Your own copy', 'Transcripts are per customer and never pooled across workspaces.'],
    ],
  },
];

export default function FeaturesPage() {
  return (
    <Site>
      <section className="section section--tight">
        <div className="wrap">
          <p className="eyebrow">Features</p>
          <h1 className="display" style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', maxWidth: '20ch' }}>
            Built around one constraint: no claim without a citation.
          </h1>
          <p className="subhead">
            Everything below follows from that. If a thing cannot be traced back to
            something said on the call, Overtone will not present it as though it can.
          </p>
        </div>
      </section>

      {GROUPS.map((group) => (
        <section className="section" key={group.title}>
          <div className="wrap">
            <h2>{group.title}</h2>
            <p className="section__lede">{group.lede}</p>
            <div className="cards">
              {group.items.map(([title, body]) => (
                <div className="card2" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="wrap">
          <div className="band">
            <h2>See it on a real call</h2>
            <p>Create a workspace and capture the next one you listen to.</p>
            <Link className="btn btn--primary btn--lg" href="/register">Start free</Link>
          </div>
        </div>
      </section>
    </Site>
  );
}
