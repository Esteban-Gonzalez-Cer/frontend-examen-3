import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { isApiError } from '@/shared/api/errors'
import { login } from '../api/authApi'
import { loginErrorMessage, validateLogin, type LoginFieldErrors } from '../model/login'
import { sessionFromLogin, sessionStore } from '../model/sessionStore'
import type { LoginInput } from '../model/types'

export function useLoginForm() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // A new login always replaces the previous token and any cached data.
      queryClient.clear()
      sessionStore.getState().start(sessionFromLogin(data))
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
    },
    onError: (error) => {
      if (isApiError(error) && error.fields.length) {
        const next: LoginFieldErrors = {}
        for (const field of error.fields) {
          if (field.field === 'email' || field.field === 'password') next[field.field] = field.message
        }
        setFieldErrors(next)
      }
    },
  })

  const setField = (field: keyof LoginInput, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (mutation.isPending) return
    const result = validateLogin(values)
    if (!result.ok) {
      setFieldErrors(result.errors)
      return
    }
    setFieldErrors({})
    mutation.mutate(result.data)
  }

  return {
    values,
    setField,
    fieldErrors,
    formError: mutation.isError ? loginErrorMessage(mutation.error) : null,
    submitting: mutation.isPending,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    submit,
  }
}
