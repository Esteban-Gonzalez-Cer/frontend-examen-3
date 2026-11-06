export interface FieldError {
  field: string
  message: string
}

/** Normalised error for anything that goes wrong talking to our backend. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: FieldError[]
  readonly details: Record<string, unknown>

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.fields = Array.isArray(details.fields) ? (details.fields as FieldError[]) : []
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

export const NETWORK_ERROR = 'NETWORK_ERROR'

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function errorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
