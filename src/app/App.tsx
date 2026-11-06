import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'

import { connectAuthToHttp, restoreSession } from '@/features/auth'
import { queryClient } from './providers/queryClient'
import { router } from './router/routes'

// Bearer token on every request; any 401 on an authenticated call ends the session.
connectAuthToHttp(() => queryClient.clear())
// The token lives in memory only: after a reload, get it back through the HttpOnly cookie.
void restoreSession()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
