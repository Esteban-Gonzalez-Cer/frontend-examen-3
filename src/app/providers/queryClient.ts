import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@/shared/api/errors'

const NO_RETRY_STATUS = new Set([400, 401, 403, 404, 409, 422])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // SII data changes rarely within a session; avoid hammering it.
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        failureCount < 1 && !(isApiError(error) && NO_RETRY_STATUS.has(error.status)),
    },
    mutations: { retry: false },
  },
})
