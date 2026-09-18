'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Shell } from '@/components/Shell';
import {
  api,
  ApiError,
  type Analysis,
  type Call,
  type ChatMessageRecord,
  type Citation,
  type Memo,
  type Note,
  type Segment,
} from '@/lib/api';

type Tab = 'captures' | 'ask' | 'signals' | 'transcript' | 'memo';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'captures', label: 'Captures & notes' },
  { id: 'ask', label: 'Ask' },
  { id: 'signals', label: 'Signals' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'memo', label: 'Memo' },
];

function stamp(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Deep-link back to the source at the exact moment a citation refers to. */
function atTime(url: string, seconds: number): string {
  try {
    const target = new URL(url);
    target.searchParams.set('t', `${Math.floor(seconds)}s`);
    return target.toString();
  } catch {
    return url;
  }
}

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  uncited: string[];
  streaming: boolean;
}

/** A stored turn, replayed into the same shape a live stream produces. */
function toTurn(record: ChatMessageRecord): ChatTurn {
  return {
    role: record.role,
    content: record.content,
    citations: record.citations ?? [],
    uncited: record.uncited ?? [],
    streaming: false,
  };
}

export default function CallPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [call, setCall] = useState<Call | null>(null);
  const [tab, setTab] = useState<Tab>('captures');
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [frames, setFrames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [memo, setMemo] = useState<Memo | null>(null);

  const [question, setQuestion] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const requested = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    api.getCall(id).then(setCall).catch((err) => {
      setError(err instanceof ApiError ? err.message : 'Could not load that call.');
    });
    api.listNotes(id).then((r) => setNotes(r.items)).catch(() => undefined);
    api.getAnalysis(id).then(setAnalysis).catch(() => undefined);
    api
      .listChat(id)
      .then((r) => setMessages(r.items.map(toTurn)))
      .catch(() => undefined);
  }, [id]);

  /** Signed URLs for stored captures; the bucket is private so an <img> needs one. */
  useEffect(() => {
    let cancelled = false;
    for (const note of notes) {
      if (!note.image_key || frames[note.id] || requested.current.has(note.id)) continue;
      requested.current.add(note.id);
      api
        .noteImageUrl(note.id)
        .then(({ url }) => {
          if (!cancelled) setFrames((prev) => ({ ...prev, [note.id]: url }));
        })
        .catch(() => requested.current.delete(note.id));
    }
    return () => {
      cancelled = true;
    };
  }, [notes, frames]);

  const loadTranscript = useCallback(() => {
    if (!id || segments.length) return;
    api.listSegments(id).then((r) => setSegments(r.items)).catch(() => undefined);
  }, [id, segments.length]);

  useEffect(() => {
    if (tab === 'transcript') loadTranscript();
  }, [tab, loadTranscript]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || !call || streaming) return;
    setQuestion('');
    setStreaming(true);
    setError(null);

    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, citations: [], uncited: [], streaming: false },
      { role: 'assistant', content: '', citations: [], uncited: [], streaming: true },
    ]);

    const patch = (fn: (turn: ChatTurn) => ChatTurn) =>
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const next = prev.slice();
        next[next.length - 1] = fn(last);
        return next;
      });

    try {
      for await (const frame of api.chat({ question: text, call_ids: [call.id], history })) {
        const data = frame.data;
        switch (frame.event) {
          case 'meta':
            patch((t) => ({ ...t, citations: (data.citations as Citation[]) ?? [] }));
            break;
          case 'token':
            patch((t) => ({ ...t, content: t.content + String(data.t ?? '') }));
            break;
          case 'warning':
            patch((t) => ({ ...t, uncited: (data.uncited as string[]) ?? [] }));
            break;
          case 'done':
            patch((t) => ({
              ...t,
              content: String(data.answer ?? t.content),
              citations: (data.citations as Citation[]) ?? t.citations,
              streaming: false,
            }));
            break;
          case 'error':
            patch((t) => ({ ...t, content: String(data.message ?? 'The answer failed.'), streaming: false }));
            break;
        }
      }
    } catch (err) {
      patch((t) => ({ ...t, streaming: false }));
      setError(err instanceof ApiError ? err.message : 'The answer stream failed.');
    } finally {
      setStreaming(false);
      patch((t) => ({ ...t, streaming: false }));
    }
  }

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not ${label.toLowerCase()}.`);
    } finally {
      setBusy(null);
    }
  }

  const captures = notes.filter((n) => n.image_key || frames[n.id]);
  const plain = notes.filter((n) => !n.image_key && !frames[n.id]);

  return (
    <Shell>
      <div className="head">
        <div className="head__text">
          <p className="small muted" style={{ margin: 0 }}>
            <Link href="/calls">← Calls</Link>
          </p>
          <h1>{call?.title || 'Call'}</h1>
          <p className="lede">
            {call ? (
              <>
                <span className="tag" data-status={call.status}>{call.status}</span>{' '}
                {call.source_url && (
                  <>
                    · <a href={call.source_url} target="_blank" rel="noreferrer">Open source</a>
                  </>
                )}
                {call.status_detail && <> · {call.status_detail}</>}
              </>
            ) : (
              'Loading…'
            )}
          </p>
        </div>
      </div>

      {error && <div className="note note--bad">{error}</div>}

      <div className="tabs" role="tablist">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            className="tab"
            role="tab"
            aria-selected={tab === entry.id}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'captures' && (
        <>
          {captures.length === 0 && plain.length === 0 ? (
            <p className="blank">
              Nothing captured yet. Use the Overtone extension on the call page — the camera
              button sits in the player controls, so it works in fullscreen too.
            </p>
          ) : (
            <>
              {captures.length > 0 && (
                <div className="captures" style={{ marginBottom: 18 }}>
                  {captures.map((note) => (
                    <div className="capture" key={note.id}>
                      {frames[note.id] ? (
                        <img src={frames[note.id]} alt={note.body || 'Captured slide'} />
                      ) : (
                        <div className="capture__ph">Loading image…</div>
                      )}
                      <div className="capture__bar">
                        <span className="num muted">{stamp(note.timestamp_s)}</span>
                        <span className="spacer" />
                        {frames[note.id] && (
                          <a
                            className="cite"
                            href={frames[note.id]}
                            download={`capture-${stamp(note.timestamp_s).replace(/:/g, '-')}.jpg`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {plain.length > 0 && (
                <>
                  <h2>Notes</h2>
                  <div className="panel">
                    <table>
                      <tbody>
                        {plain.map((note) => (
                          <tr key={note.id}>
                            <td className="num muted" style={{ width: 80 }}>
                              {call?.source_url ? (
                                <a href={atTime(call.source_url, note.timestamp_s)} target="_blank" rel="noreferrer">
                                  {stamp(note.timestamp_s)}
                                </a>
                              ) : (
                                stamp(note.timestamp_s)
                              )}
                            </td>
                            <td>{note.body}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {tab === 'ask' && (
        <>
          <div className="panel panel--pad">
            {messages.length === 0 ? (
              <p className="blank" style={{ padding: '20px 0' }}>
                Ask anything management said. Every answer cites the moment it came from.
              </p>
            ) : (
              messages.map((message, index) => (
                <div className={`msg msg--${message.role}`} key={index}>
                  <div className="msg__role">{message.role === 'user' ? 'You' : 'Overtone'}</div>
                  <div className="msg__body">
                    {message.content}
                    {message.streaming && <span className="spin" style={{ marginLeft: 6 }} />}
                  </div>
                  {message.citations.length > 0 && (
                    <div className="cites">
                      {message.citations.map((c) => (
                        <a
                          className="cite"
                          key={c.chunk_id}
                          href={call ? atTime(call.source_url, c.start_s) : '#'}
                          target="_blank"
                          rel="noreferrer"
                          title={`${c.speakers || 'unattributed'} · ${c.section}`}
                        >
                          [{c.n}] {c.timestamp}
                        </a>
                      ))}
                    </div>
                  )}
                  {message.uncited.length > 0 && (
                    <div className="note note--hold" style={{ marginTop: 8 }}>
                      Not supported by the transcript:
                      <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                        {message.uncited.map((claim, i) => (
                          <li key={i}>{claim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <form className="row" onSubmit={ask}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="What changed in the margin guidance?"
              value={question}
              disabled={!call || streaming}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button className="btn btn--primary" type="submit" disabled={!call || streaming}>
              {streaming ? 'Answering…' : 'Ask'}
            </button>
          </form>
        </>
      )}

      {tab === 'signals' && (
        <>
          <div className="row" style={{ marginBottom: 14 }}>
            <button
              className="btn"
              disabled={busy !== null}
              onClick={() =>
                run('Run analysis', async () => {
                  if (id) setAnalysis(await api.runAnalysis(id));
                })
              }
            >
              {busy === 'Run analysis' ? <><span className="spin" /> Analysing…</> : analysis ? 'Re-run analysis' : 'Run analysis'}
            </button>
            <span className="hint" style={{ marginTop: 0 }}>
              Hedging is measured per 1,000 words of management speech.
            </span>
          </div>

          {!analysis ? (
            <p className="blank">No analysis yet. Run one once the transcript is indexed.</p>
          ) : (
            <>
              <div className="grid">
                <div className="panel panel--pad">
                  <div className="stat__label">Hedge rate</div>
                  <div className="stat__value mono">{analysis.tone.hedge_rate.toFixed(1)}</div>
                  <div className="stat__sub">per 1,000 words</div>
                </div>
                <div className="panel panel--pad">
                  <div className="stat__label">Net confidence</div>
                  <div className="stat__value mono">{analysis.tone.net_confidence.toFixed(1)}</div>
                  <div className="stat__sub">confident minus negative</div>
                </div>
                <div className="panel panel--pad">
                  <div className="stat__label">Q&amp;A pairs</div>
                  <div className="stat__value mono">{analysis.qa_pairs}</div>
                  <div className="stat__sub">{analysis.segments} segments</div>
                </div>
                <div className="panel panel--pad">
                  <div className="stat__label">Unanswered</div>
                  <div className="stat__value mono">{analysis.dodges.length}</div>
                  <div className="stat__sub">questions flagged</div>
                </div>
              </div>

              {analysis.tone.hedges_found.length > 0 && (
                <>
                  <h2>Hedging phrases found</h2>
                  <div className="card row">
                    {analysis.tone.hedges_found.slice(0, 40).map((phrase, i) => (
                      <span className="tag" key={i}>{phrase}</span>
                    ))}
                  </div>
                </>
              )}

              {analysis.dodges.length > 0 && (
                <>
                  <h2>Questions that did not get an answer</h2>
                  {analysis.dodges.map((dodge) => (
                    <div className="panel panel--pad" key={dodge.question_id}>
                      <div className="row small muted" style={{ marginBottom: 6 }}>
                        {call?.source_url ? (
                          <a href={atTime(call.source_url, dodge.start_s)} target="_blank" rel="noreferrer">
                            {stamp(dodge.start_s)}
                          </a>
                        ) : (
                          <span className="num">{stamp(dodge.start_s)}</span>
                        )}
                        <span>· {dodge.analyst || 'Analyst'}</span>
                        <span className="spacer" />
                        <span className="tag">score {dodge.score.toFixed(2)}</span>
                      </div>
                      <div>{dodge.question}</div>
                      {dodge.reasons.length > 0 && (
                        <div className="row" style={{ marginTop: 8 }}>
                          {dodge.reasons.map((reason, i) => (
                            <span className="tag" key={i}>{reason}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {tab === 'transcript' && (
        <div className="panel panel--pad">
          {segments.length === 0 ? (
            <p className="blank" style={{ padding: '20px 0' }}>
              No transcript indexed for this call yet.
            </p>
          ) : (
            segments.map((seg) => (
              <div className="seg" key={seg.id}>
                <div className="seg__t mono">
                  {call?.source_url ? (
                    <a href={atTime(call.source_url, seg.start_s)} target="_blank" rel="noreferrer">
                      {stamp(seg.start_s)}
                    </a>
                  ) : (
                    stamp(seg.start_s)
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  {(seg.speaker || seg.affiliation) && (
                    <div className="seg__who">
                      {seg.speaker}
                      {seg.affiliation && <span className="seg__aff"> · {seg.affiliation}</span>}
                    </div>
                  )}
                  <div>{seg.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'memo' && (
        <>
          <div className="row" style={{ marginBottom: 14 }}>
            <button
              className="btn btn--primary"
              disabled={busy !== null}
              onClick={() =>
                run('Draft memo', async () => {
                  if (id) setMemo(await api.createMemo(id));
                })
              }
            >
              {busy === 'Draft memo' ? <><span className="spin" /> Drafting…</> : 'Draft a memo'}
            </button>
            <span className="hint" style={{ marginTop: 0 }}>
              Every claim is checked against the transcript before it is kept.
            </span>
          </div>
          {!memo ? (
            <p className="blank">No memo drafted in this session. Existing memos live under Memos.</p>
          ) : (
            <div className="panel panel--pad">
              <h2 style={{ marginTop: 0 }}>{memo.title}</h2>
              <div className="prose">{memo.body_md}</div>
              {memo.citations?.length > 0 && (
                <div className="cites">
                  {memo.citations.map((c) => (
                    <a
                      className="cite"
                      key={c.chunk_id ?? c.n}
                      href={call ? atTime(call.source_url, c.start_s) : '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      [{c.n}] {c.timestamp}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
