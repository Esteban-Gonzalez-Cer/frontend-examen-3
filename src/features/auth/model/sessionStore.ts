import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import type { LoginResponseDto, Session, SessionEndReason } from './types'

export interface SessionState {
  session: Session | null
  endReason: SessionEndReason | null
  start: (session: Session) => void
  end: (reason: SessionEndReason) => void
}

/**
 * The SII token lives only for this browser tab (sessionStorage) and is fully replaced on
 * every login. There is no logout endpoint: logging out simply forgets it.
 */
export const sessionStore = createStore<SessionState>()(
  persist(
    (set) => ({
      session: null,
      endReason: null,
      start: (session) => set({ session, endReason: null }),
      end: (reason) => set({ session: null, endReason: reason }),
    }),
    {
      name: 'trayecta.session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ session: state.session }),
    },
  ),
)

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
