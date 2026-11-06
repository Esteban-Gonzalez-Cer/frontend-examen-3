import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useStore } from 'zustand'

import { useNow } from '@/shared/lib/hooks'
import { getActiveToken, revokeSession } from '../api/authApi'
import { endSession, isSessionActive, msUntilExpiry, sessionStore } from '../model/sessionStore'

export function useSession() {
  return useStore(sessionStore, (state) => state.session)
}

export function useSessionEndReason() {
  return useStore(sessionStore, (state) => state.endReason)
}

/** False while the app is still trying to restore the session after a reload. */
export function useSessionRestored(): boolean {
  return useStore(sessionStore, (state) => state.restored)
}

export function useIsAuthenticated(): boolean {
  const session = useSession()
  return isSessionActive(session)
}

export function useIsAdmin(): boolean {
  return useSession()?.student.isAdmin ?? false
}

/**
 * Log out: forget the token in memory and the cached data right away, and ask the backend to
 * revoke the session and delete the HttpOnly refresh cookie (only the server can delete it).
 */
export function useLogout() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    const token = getActiveToken()
    endSession('logout')
    queryClient.clear()
    void revokeSession(token)
  }, [queryClient])
}

/** Ends the session exactly when it expires, even if the tab was in the background. */
export function useSessionWatcher() {
  const session = useSession()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!session) return
    const expire = () => {
      endSession('expired')
      queryClient.clear()
    }
    const remaining = msUntilExpiry(session)
    if (remaining <= 0) {
      expire()
      return
    }
    // setTimeout overflows above ~24.8 days; sessions here last minutes.
    const timer = window.setTimeout(expire, remaining)
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !isSessionActive(sessionStore.getState().session)) expire()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [session, queryClient])
}

export function useSessionCountdown(): number {
  const session = useSession()
  const now = useNow(1000)
  return Math.max(0, msUntilExpiry(session, now))
}
