import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useStore } from 'zustand'

import { useNow } from '@/shared/lib/hooks'
import { endSession, isSessionActive, msUntilExpiry, sessionStore } from '../model/sessionStore'

export function useSession() {
  return useStore(sessionStore, (state) => state.session)
}

export function useSessionEndReason() {
  return useStore(sessionStore, (state) => state.endReason)
}

export function useIsAuthenticated(): boolean {
  const session = useSession()
  return isSessionActive(session)
}

export function useIsAdmin(): boolean {
  return useSession()?.student.isAdmin ?? false
}

/** Forget the token (there is no logout endpoint) and clear cached data. */
export function useLogout() {
  const queryClient = useQueryClient()
  return useCallback(() => {
    endSession('logout')
    queryClient.clear()
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
