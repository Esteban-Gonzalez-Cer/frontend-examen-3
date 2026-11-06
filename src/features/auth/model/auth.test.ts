import { beforeEach, describe, expect, it } from 'vitest'

import { ApiError, NETWORK_ERROR } from '@/shared/api/errors'
import { loginErrorMessage, validateLogin } from './login'
import { endSession, getActiveToken, isSessionActive, sessionStore } from './sessionStore'
import type { Session } from './types'

const student = { numeroControl: '23031035', fullName: 'ESTEBAN', email: 'l23031035@celaya.tecnm.mx', isAdmin: false }

function session(token: string, minutes: number): Session {
  return { token, expiresAt: new Date(Date.now() + minutes * 60_000).toISOString(), student }
}

describe('login validation', () => {
  it('reports empty fields', () => {
    const result = validateLogin({ email: '  ', password: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.email).toMatch(/correo/i)
      expect(result.errors.password).toMatch(/contraseña/i)
    }
  })

  it('rejects malformed emails and trims valid ones', () => {
    expect(validateLogin({ email: 'nope', password: 'x' }).ok).toBe(false)
    const ok = validateLogin({ email: ' l23031035@celaya.tecnm.mx ', password: 'x' })
    expect(ok.ok && ok.data.email).toBe('l23031035@celaya.tecnm.mx')
  })

  it('maps backend errors to messages', () => {
    expect(loginErrorMessage(new ApiError(401, 'INVALID_CREDENTIALS', 'x'))).toBe('Correo o contraseña incorrectos.')
    expect(loginErrorMessage(new ApiError(503, 'SII_UNAVAILABLE', 'x'))).toMatch(/SII no está disponible/)
    expect(loginErrorMessage(new ApiError(0, NETWORK_ERROR, 'x'))).toMatch(/conectar/)
  })
})

describe('session store', () => {
  beforeEach(() => sessionStore.setState({ session: null, endReason: null }))

  it('a new login replaces the previous token', () => {
    sessionStore.getState().start(session('old', 30))
    sessionStore.getState().start(session('new', 30))
    expect(getActiveToken()).toBe('new')
  })

  it('expired sessions are not active and give no token', () => {
    sessionStore.getState().start(session('t', -1))
    expect(isSessionActive(sessionStore.getState().session)).toBe(false)
    expect(getActiveToken()).toBeNull()
  })

  it('logging out forgets the token and records the reason', () => {
    sessionStore.getState().start(session('t', 30))
    endSession('expired')
    expect(sessionStore.getState().session).toBeNull()
    expect(sessionStore.getState().endReason).toBe('expired')
  })

  it('persists only the session in sessionStorage', () => {
    sessionStore.getState().start(session('persisted', 30))
    const raw = sessionStorage.getItem('trayecta.session') ?? ''
    expect(raw).toContain('persisted')
    expect(raw).not.toContain('endReason')
  })
})
