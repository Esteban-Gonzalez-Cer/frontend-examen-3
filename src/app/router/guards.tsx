import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { isSessionActive, useIsAdmin, useSession, useSessionRestored } from '@/features/auth'
import { Spinner } from '@/shared/ui'

/** Private routes: without a valid (non-expired) token, go back to the login page. */
function RestoringSession() {
  return (
    <div className="app-surface grid min-h-dvh place-items-center">
      <Spinner label="Restaurando sesión…" />
    </div>
  )
}

export function ProtectedRoute() {
  const session = useSession()
  const restored = useSessionRestored()
  const location = useLocation()
  if (!restored) return <RestoringSession />
  if (!isSessionActive(session)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const session = useSession()
  const restored = useSessionRestored()
  const location = useLocation()
  if (!restored) return <RestoringSession />
  if (isSessionActive(session)) {
    // Back to where the user was when the session ended (or the dashboard).
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from !== '/login' ? from : '/dashboard'} replace />
  }
  return <>{children}</>
}

export function AdminRoute() {
  const isAdmin = useIsAdmin()
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
