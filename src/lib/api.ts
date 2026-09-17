/**
 * API client for the dashboard.
 *
 * Tokens are held in memory plus `sessionStorage` — not `localStorage` — so a
 * shared or kiosk machine does not retain a fund's session after the tab closes.
 */

export const API_V1 = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`;

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
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const session = auth ? readSession() : null;
  if (auth && !session) throw new ApiError(401, 'unauthorized', 'Sign in to continue.');

  const response = await fetch(`${API_V1}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session
        ? { Authorization: `Bearer ${session.accessToken}`, 'X-Organization-Id': session.organizationId }
        : {}),
      ...((init.headers as Record<string, string>) ?? {}),
    },
  });

  if (!response.ok) {
    let code = 'http_error';
    let message = `Request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } };
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, code, message);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export interface Call {
  id: string;
  company_id: string;
  title: string;
  status: string;
  status_detail: string;
  fiscal_year: number | null;
  fiscal_quarter: number | null;
  source_url: string;
  duration_seconds: number | null;
}

export interface Memo {
  id: string;
  call_id: string;
  title: string;
  body_md: string;
  citations: Array<{ n: number; timestamp: string; speakers: string; section: string }>;
  status: string;
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

export const api = {
  async login(email: string, password: string): Promise<Session> {
    const tokens = await request<{ access_token: string; refresh_token: string; expires_in: number }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    );
    const me = await request<{ user: { email: string }; active_organization_id: string }>(
      '/auth/me',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
      false,
    );
    const session: Session = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      organizationId: me.active_organization_id,
      email: me.user.email,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    writeSession(session);
    return session;
  },

  signup(input: { email: string; password: string; full_name: string; organization_name: string }) {
    return request<{ access_token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    }, false);
  },

  listCalls: () => request<{ items: Call[]; total: number }>('/calls?limit=100'),
  getCall: (id: string) => request<Call>(`/calls/${id}`),
  listMemos: () => request<{ items: Memo[] }>('/memos'),
  createMemo: (callId: string) => request<Memo>(`/calls/${callId}/memo`, { method: 'POST' }),
  usage: () => request<{ plan: string; items: UsageItem[] }>('/usage'),
  plans: () => request<Plan[]>('/plans', {}, false),
};
