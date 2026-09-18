/**
 * API client for the dashboard.
 *
 * Tokens are held in `sessionStorage` — not `localStorage` — so a shared or kiosk
 * machine does not retain a fund's session after the tab closes.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const API_V1 = `${API_BASE}/api/v1`;

export interface Session {
  accessToken: string;
  refreshToken: string;
  organizationId: string;
  email: string;
  expiresAt: number;
}

const KEY = 'overtone.session';

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  window.sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.sessionStorage.removeItem(KEY);
}

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }

  /** True when the failure is a plan limit rather than a fault. */
  get isQuota(): boolean {
    return this.status === 402;
  }
}

/**
 * Refresh the access token, collapsing concurrent callers onto one request.
 *
 * Access tokens live 30 minutes. Without this the dashboard simply stopped working
 * mid-session and bounced the analyst to the login screen — with every refresh
 * token still perfectly valid. Refresh tokens are single-use server-side, so two
 * parallel refreshes would race and one would be rejected.
 */
let refreshInFlight: Promise<Session | null> | null = null;

async function refresh(session: Session): Promise<Session | null> {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_V1}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      if (!response.ok) {
        clearSession();
        return null;
      }
      const tokens = (await response.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
      const next: Session = {
        ...session,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      };
      writeSession(next);
      return next;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** True when the access token is expired or within 60s of expiring. */
function isExpiring(session: Session): boolean {
  return Date.now() + 60_000 >= session.expiresAt;
}

async function authorized(): Promise<Session> {
  let session = readSession();
  if (!session) throw new ApiError(401, 'unauthorized', 'Sign in to continue.');
  if (isExpiring(session)) {
    session = await refresh(session);
    if (!session) throw new ApiError(401, 'unauthorized', 'Your session expired. Sign in again.');
  }
  return session;
}

async function toError(response: Response): Promise<ApiError> {
  let code = 'http_error';
  let message = `Request failed (${response.status}).`;
  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string } };
    code = body.error?.code ?? code;
    message = body.error?.message ?? message;
  } catch {
    /* non-JSON error body */
  }
  return new ApiError(response.status, code, message);
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const session = auth ? await authorized() : null;

  const send = (token: Session | null): Promise<Response> =>
    fetch(`${API_V1}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token.accessToken}`,
              'X-Organization-Id': token.organizationId,
            }
          : {}),
        ...((init.headers as Record<string, string>) ?? {}),
      },
    });

  let response = await send(session);

  // A token can be rejected even when it looked fresh — a password change revokes
  // every other session server-side. One retry after a refresh, then give up.
  if (response.status === 401 && session) {
    const renewed = await refresh(session);
    if (!renewed) throw new ApiError(401, 'unauthorized', 'Your session expired. Sign in again.');
    response = await send(renewed);
  }

  if (!response.ok) throw await toError(response);
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

// ------------------------------------------------------------------ types

export interface Call {
  id: string;
  company_id: string;
  title: string;
  kind: string;
  status: 'pending' | 'transcribing' | 'indexing' | 'ready' | 'failed';
  status_detail: string;
  fiscal_year: number | null;
  fiscal_quarter: number | null;
  occurred_at: string | null;
  source_url: string;
  source_platform: string;
  duration_seconds: number | null;
}

export interface Citation {
  n: number;
  chunk_id: string;
  call_id: string;
  start_s: number;
  timestamp: string;
  speakers: string;
  section: string;
  quote: string;
}

export interface Note {
  id: string;
  call_id: string;
  kind: string;
  timestamp_s: number;
  body: string;
  image_key: string;
}

export interface ChatMessageRecord {
  id: string;
  call_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  uncited: string[];
  created_at: string;
}

export interface Analysis {
  call_id: string;
  tone: {
    word_count: number;
    hedge_rate: number;
    negative_rate: number;
    confident_rate: number;
    net_confidence: number;
    hedges_found: string[];
    negatives_found: string[];
    confidents_found: string[];
  };
  dodges: Array<{
    question_id: string;
    start_s: number;
    analyst: string;
    question: string;
    score: number;
    reasons: string[];
  }>;
  qa_pairs: number;
  segments: number;
}

export interface Memo {
  id: string;
  call_id: string;
  title: string;
  template: string;
  body_md: string;
  citations: Citation[];
  status: string;
}

export interface Segment {
  id: string;
  start_s: number;
  end_s: number;
  speaker: string;
  affiliation: string;
  section: string;
  text: string;
}

export interface UsageItem {
  kind: string;
  used: number;
  limit: number;
  remaining: number;
}

export interface Plan {
  slug: string;
  name: string;
  description: string;
  monthly_price_usd: number;
  annual_price_usd: number;
  monthly_calls: number;
  monthly_chat_messages: number;
  monthly_memos: number;
  max_seats: number;
  cross_call_search: boolean;
  qoq_analysis: boolean;
  sso_enabled: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface SessionInfo {
  user: { id: string; email: string; full_name: string; is_verified: boolean };
  organizations: Organization[];
  active_organization_id: string | null;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

async function establish(tokens: TokenPair): Promise<Session> {
  const me = await request<SessionInfo>(
    '/auth/me',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    false,
  );
  const session: Session = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    organizationId: me.active_organization_id ?? '',
    email: me.user.email,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
  writeSession(session);
  return session;
}

// -------------------------------------------------------------------- api

export const api = {
  async login(email: string, password: string): Promise<Session> {
    const tokens = await request<TokenPair>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    );
    return establish(tokens);
  },

  async signup(input: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
  }): Promise<Session> {
    const tokens = await request<TokenPair>(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify(input) },
      false,
    );
    return establish(tokens);
  },

  async logout(): Promise<void> {
    const session = readSession();
    if (session) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      }).catch(() => undefined);
    }
    clearSession();
  },

  changePassword(current_password: string, new_password: string) {
    return request<{ ok: boolean; message: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  me: () => request<SessionInfo>('/auth/me'),

  listCalls: () => request<{ items: Call[]; total: number }>('/calls?limit=100'),
  getCall: (id: string) => request<Call>(`/calls/${id}`),
  listSegments: (id: string) =>
    request<{ items: Segment[]; total: number }>(`/calls/${id}/segments?limit=200`),

  listNotes: (id: string) => request<{ items: Note[] }>(`/calls/${id}/notes`),
  deleteNote: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
  noteImageUrl: (id: string) => request<{ url: string; expires_in: number }>(`/notes/${id}/image`),

  listChat: (id: string) => request<{ items: ChatMessageRecord[] }>(`/calls/${id}/chat`),

  getAnalysis: (id: string) => request<Analysis>(`/calls/${id}/analysis`),
  runAnalysis: (id: string) => request<Analysis>(`/calls/${id}/analysis`, { method: 'POST' }),

  listMemos: () => request<{ items: Memo[] }>('/memos'),
  createMemo: (callId: string) => request<Memo>(`/calls/${callId}/memo`, { method: 'POST' }),

  usage: () => request<{ plan: string; period_days: number; items: UsageItem[] }>('/usage'),
  plans: () => request<Plan[]>('/plans', {}, false),

  /**
   * Ask a question, streamed.
   *
   * Uses `fetch` + a reader rather than `EventSource`, which cannot send an
   * Authorization header or a POST body — and this endpoint needs both.
   */
  async *chat(input: { question: string; call_ids: string[]; history: Array<{ role: string; content: string }> }) {
    const session = await authorized();
    const response = await fetch(`${API_V1}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
        'X-Organization-Id': session.organizationId,
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw await toError(response);
    const body = response.body;
    if (!body) return;

    const reader = body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        // Frames are separated by a blank line; a frame split across two network
        // chunks must not be dropped, which is why the buffer persists.
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          let event = 'message';
          const data: string[] = [];
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
          }
          if (data.length) {
            const raw = data.join('\n');
            let parsed: unknown = raw;
            try {
              parsed = JSON.parse(raw);
            } catch {
              /* a non-JSON payload is still a frame */
            }
            yield { event, data: parsed as Record<string, unknown> };
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
