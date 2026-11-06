import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'

import { connectAuthToHttp } from '@/features/auth'
import { queryClient } from './providers/queryClient'
import { router } from './router/routes'

// Bearer token on every request; any 401 on an authenticated call ends the session.
connectAuthToHttp(() => queryClient.clear())

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
