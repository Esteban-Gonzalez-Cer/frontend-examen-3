import { createStore } from 'zustand/vanilla'

import type { LoginResponseDto, Session, SessionEndReason } from './types'

export interface SessionState {
  session: Session | null
  endReason: SessionEndReason | null
  /** False until the startup refresh attempt finished (guards wait for it). */
  restored: boolean
  start: (session: Session) => void
  end: (reason: SessionEndReason) => void
  markRestored: () => void
}

/**
 * The access token (SII token) lives **only in memory**: never in localStorage/sessionStorage,
 * so an injected script cannot read it from storage. A page reload wipes it; the app then asks
 * the backend to restore it using the refresh token, which sits in an HttpOnly cookie that
 * JavaScript cannot read at all. Every login fully replaces the previous session.
 */
export const sessionStore = createStore<SessionState>()((set) => ({
  session: null,
  endReason: null,
  restored: false,
  start: (session) => set({ session, endReason: null, restored: true }),
  end: (reason) => set({ session: null, endReason: reason }),
  markRestored: () => set({ restored: true }),
}))

export function sessionFromLogin(dto: LoginResponseDto): Session {
  return { token: dto.accessToken, expiresAt: dto.expiresAt, student: dto.student }
}

export function msUntilExpiry(session: Session | null, now: number = Date.now()): number {
  if (!session) return 0
  return Date.parse(session.expiresAt) - now
}

export function isSessionActive(session: Session | null, now: number = Date.now()): session is Session {
  return session !== null && msUntilExpiry(session, now) > 0
}

export function getActiveToken(now: number = Date.now()): string | null {
  const { session } = sessionStore.getState()
  return isSessionActive(session, now) ? session.token : null
}

export function endSession(reason: SessionEndReason): void {
  if (sessionStore.getState().session) {
    sessionStore.getState().end(reason)
  }
}
