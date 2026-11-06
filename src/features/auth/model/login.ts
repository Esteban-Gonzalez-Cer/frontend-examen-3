import { z } from 'zod'

import { isApiError, NETWORK_ERROR } from '@/shared/api/errors'
import type { LoginInput } from './types'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo institucional.')
    .email('Ingresa un correo válido, por ejemplo l23031035@celaya.tecnm.mx.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>

export type LoginValidation =
  | { ok: true; data: LoginInput }
  | { ok: false; errors: LoginFieldErrors }

export function validateLogin(input: LoginInput): LoginValidation {
  const parsed = loginSchema.safeParse(input)
  if (parsed.success) return { ok: true, data: parsed.data }
  const errors: LoginFieldErrors = {}
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as keyof LoginInput
    errors[field] ??= issue.message
  }
  return { ok: false, errors }
}

/** Human message for each way the login can fail. */
export function loginErrorMessage(error: unknown): string {
  if (!isApiError(error)) return 'No se pudo iniciar sesión. Intenta de nuevo.'
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Correo o contraseña incorrectos.'
    case 'SII_UNAVAILABLE':
      return 'El SII no está disponible en este momento. Intenta más tarde.'
    case 'SII_BAD_RESPONSE':
      return 'El SII respondió de forma inesperada. Intenta más tarde.'
    case NETWORK_ERROR:
      return 'No se pudo conectar con el servidor. Verifica tu conexión.'
    case 'VALIDATION_ERROR':
      return 'Revisa los campos marcados.'
    default:
      return error.message
  }
}
