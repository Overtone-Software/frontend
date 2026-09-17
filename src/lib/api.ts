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

