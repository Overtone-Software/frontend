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

