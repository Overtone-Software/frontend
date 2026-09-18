'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from './api';

export type BackendState = 'checking' | 'waking' | 'ready' | 'unreachable';

/**
 * Don't announce anything for a server that is simply awake. A warm instance
 * answers in well under this, so the banner never flashes on a normal visit.
 */
const QUIET_MS = 1200;
/** Render's free tier advertises ~50s to wake; allow generous headroom. */
const GIVE_UP_MS = 120_000;
const POLL_MS = 2_000;

/**
 * Watch whether the API is answering.
 *
 * The backend sleeps after 15 minutes idle on Render's free plan and takes up to a
 * minute to wake. Without this the dashboard just hangs on first load and reads as
 * broken, which is the single most common thing a new user will hit.
 *
 * `/health` is unauthenticated and deliberately touches nothing, so polling it is
 * cheap and cannot be taken down by a slow database.
 */
export function useBackendStatus() {
  const [state, setState] = useState<BackendState>('checking');
  const [elapsed, setElapsed] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const startedAt = useRef(Date.now());

  const retry = useCallback(() => {
    startedAt.current = Date.now();
    setElapsed(0);
    setState('checking');
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    startedAt.current = Date.now();

    const tick = async (): Promise<void> => {
      if (stopped) return;
      const waited = Date.now() - startedAt.current;
      setElapsed(Math.round(waited / 1000));

      try {
        const response = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
        if (stopped) return;
        if (response.ok) {
          setState('ready');
          return;
        }
      } catch {
        // A sleeping instance refuses the connection outright; that is not an error
        // worth surfacing until it has gone on long enough to matter.
      }
      if (stopped) return;

      if (waited > GIVE_UP_MS) {
        setState('unreachable');
        return;
      }
      setState(waited > QUIET_MS ? 'waking' : 'checking');
      timer = window.setTimeout(() => void tick(), POLL_MS);
    };

    void tick();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [attempt]);

  return { state, elapsed, retry };
}
