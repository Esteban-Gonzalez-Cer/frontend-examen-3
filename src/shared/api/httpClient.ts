import axios, { AxiosError, type AxiosInstance } from 'axios'

import { API_BASE_URL } from '@/shared/config/env'
import { ApiError, NETWORK_ERROR } from './errors'

interface AuthBridge {
  getToken: () => string | null
  onUnauthorized: () => void
}

// `shared` must not know about features, so the auth feature registers itself at bootstrap.
let authBridge: AuthBridge = { getToken: () => null, onUnauthorized: () => {} }

export function registerAuthBridge(bridge: AuthBridge): void {
  authBridge = bridge
}

interface ErrorPayload {
  error?: { code?: string; message?: string; details?: Record<string, unknown> }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof AxiosError) {
    if (!error.response) {
      return new ApiError(
        0,
        NETWORK_ERROR,
        'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté en ejecución.',
      )
    }
    const body = error.response.data as ErrorPayload | undefined
    return new ApiError(
      error.response.status,
      body?.error?.code ?? 'HTTP_ERROR',
      body?.error?.message ?? `Error ${error.response.status}`,
      body?.error?.details ?? {},
    )
  }
  return new ApiError(0, 'UNKNOWN', 'Ocurrió un error inesperado.')
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = authBridge.getToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    // Only an authenticated request can mean "your session is over"; a 401 from the login
    // endpoint just means wrong credentials.
    const sentToken = error instanceof AxiosError && Boolean(error.config?.headers?.Authorization)
    if (apiError.isUnauthorized && sentToken) {
      authBridge.onUnauthorized()
    }
    return Promise.reject(apiError)
  },
)
