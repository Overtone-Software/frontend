'use client';

import { useEffect, useState } from 'react';
import { useBackendStatus } from '@/lib/health';

/**
 * Tells the user the server is waking, instead of letting the product look broken.
 *
 * Silent when the server is awake — which is the common case — and silent for the
 * first moment of any visit, so a warm load never flashes a banner. Once it has
 * reported waking, it confirms readiness briefly rather than vanishing without
 * explanation, so the wait visibly resolves.
 */
export function BackendStatus() {
  const { state, elapsed, retry } = useBackendStatus();
  const [announced, setAnnounced] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state === 'waking') setAnnounced(true);
  }, [state]);

  useEffect(() => {
    if (state !== 'ready' || !announced) return;
    setConfirming(true);
    const timer = window.setTimeout(() => setConfirming(false), 2600);
    return () => window.clearTimeout(timer);
  }, [state, announced]);

  if (state === 'checking') return null;
  if (state === 'ready' && !confirming) return null;

  if (state === 'ready') {
    return (
      <div className="note note--good" role="status">
        Server is ready. Carry on.
      </div>
    );
  }

  if (state === 'unreachable') {
    return (
      <div className="note note--bad" role="alert">
        <strong>Can&apos;t reach the server.</strong> It has been {elapsed} seconds with no
        answer, which is longer than a normal wake-up.{' '}
        <button
          className="tab"
          style={{ padding: 0, borderBottom: 0, color: 'inherit', textDecoration: 'underline' }}
          onClick={retry}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="note note--hold" role="status">
      <span className="spin" style={{ marginRight: 8 }} />
      <strong>Waking the server.</strong> It sleeps after 15 minutes of no use and takes
      up to a minute to start, so the first load is slow. Waiting {elapsed}s — you can
      sign in as soon as this clears.
    </div>
  );
}
