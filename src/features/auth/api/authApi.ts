import { http, registerAuthBridge } from '@/shared/api/httpClient'
import { endSession, getActiveToken, sessionFromLogin, sessionStore } from '../model/sessionStore'
import type { LoginInput, LoginResponseDto } from '../model/types'

export async function login(input: LoginInput): Promise<LoginResponseDto> {
  const { data } = await http.post<LoginResponseDto>('/auth/login', input)
  return data
}

let restoring: Promise<void> | null = null

/**
 * On startup (or reload) ask the backend for the access token using the HttpOnly refresh
 * cookie. No cookie or an expired session simply means "not logged in". Runs once even if
 * called concurrently.
 */
export function restoreSession(): Promise<void> {
  restoring ??= http
    .post<LoginResponseDto>('/auth/refresh')
    .then(({ data }) => sessionStore.getState().start(sessionFromLogin(data)))
    .catch(() => undefined)
    .finally(() => sessionStore.getState().markRestored())
  return restoring
}

/**
 * Revoke the session on the server (deletes it and clears the HttpOnly cookie, which
 * JavaScript cannot do). Failures are ignored: the frontend logs out locally regardless and
 * the server session still expires on its own.
 */
export function revokeSession(token: string | null): Promise<void> {
  return http
    .post('/auth/logout', undefined, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    .then(() => undefined)
    .catch(() => undefined)
}

/** Called once at bootstrap: attach the bearer token and react to 401s. */
export function connectAuthToHttp(onSessionEnded: () => void): void {
  registerAuthBridge({
    getToken: () => getActiveToken(),
    onUnauthorized: () => {
      endSession('expired')
      onSessionEnded()
    },
  })
}

export { getActiveToken }
