import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { LoginPage } from '@/features/auth'
import { ProtectedRoute, PublicOnlyRoute } from './guards'
// Test-only access to the store to simulate an existing/expired session.
import { sessionStore } from '@/features/auth/model/sessionStore'

const student = { numeroControl: '23031035', fullName: 'ESTEBAN', email: 'e@x.mx', isAdmin: false }

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      { element: <ProtectedRoute />, children: [{ path: '/dashboard', element: <p>Dashboard privado</p> }] },
    ],
    { initialEntries: [path] },
  )
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

describe('route guards', () => {
  beforeEach(() => sessionStore.setState({ session: null, endReason: null }))

  it('redirects to login without a token', async () => {
    const router = renderAt('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('redirects to login when the token expired and explains why', async () => {
    sessionStore.setState({
      session: { token: 't', expiresAt: new Date(Date.now() - 1000).toISOString(), student },
      endReason: 'expired',
    })
    renderAt('/dashboard')
    expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
  })

  it('lets an active session through and keeps it out of /login', async () => {
    sessionStore.setState({
      session: { token: 't', expiresAt: new Date(Date.now() + 60_000).toISOString(), student },
      endReason: null,
    })
    const router = renderAt('/login')
    expect(await screen.findByText('Dashboard privado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('validates empty fields before calling the backend', async () => {
    renderAt('/login')
    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(screen.getByText('Ingresa tu correo institucional.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
  })
})
