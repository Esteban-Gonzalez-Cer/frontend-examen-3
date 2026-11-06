import { CircleAlert, Clock, Eye, EyeOff, Lock, Mail } from 'lucide-react'

import { Button, GlassCard, TextField } from '@/shared/ui'
import { useLoginForm } from '../hooks/useLoginForm'
import { useSessionEndReason } from '../hooks/useSession'

const HIGHLIGHTS = [
  { title: 'Kardex y calificaciones'},
  { title: 'Horario'},
  { title: 'Simulador What-If' },
]

export function LoginPage() {
  const form = useLoginForm()
  const endReason = useSessionEndReason()

  return (
    <div className="app-surface flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8">
      <div className="grid grid-cols-1 w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <section className="hidden lg:block">
          <span className="inline-flex items-center rounded-full border border-ink/40 px-6 py-2 text-3xl font-light">SII</span>
          <h1 className="mt-10 text-6xl leading-[1.05] font-light tracking-tight">
            Trayectoria
            <br />
            académica.
          </h1>
          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map((item, index) => (
              <li key={item.title} className="flex items-start gap-4">
                <span className={index === 2 ? 'mt-1 size-3 rounded-full bg-accent' : 'mt-1 size-3 rounded-full bg-ink'} aria-hidden />
                <div>
                  <p className="text-lg">{item.title}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <GlassCard className="mx-auto w-full max-w-md p-7 sm:p-9">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="inline-flex items-center rounded-full border border-ink/40 px-4 py-1.5 text-2xl font-light">Trayecta</span>
          </div>
          <h2 className="text-3xl font-light tracking-tight">Inicia sesión</h2>
          {endReason === 'expired' ? (
            <p role="status" className="mt-5 flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
              <Clock className="size-4 shrink-0" aria-hidden />
              Tu sesión expiró. Inicia sesión de nuevo.
            </p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={form.submit} noValidate>
            <TextField
              label="Correo institucional"
              type="email"
              autoComplete="username"
              placeholder="l23031035@celaya.tecnm.mx"
              icon={<Mail className="size-4" aria-hidden />}
              value={form.values.email}
              onChange={(e) => form.setField('email', e.target.value)}
              error={form.fieldErrors.email}
            />
            <TextField
              label="Contraseña"
              type={form.showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              icon={<Lock className="size-4" aria-hidden />}
              value={form.values.password}
              onChange={(e) => form.setField('password', e.target.value)}
              error={form.fieldErrors.password}
              trailing={
                <button
                  type="button"
                  onClick={form.toggleShowPassword}
                  className="text-muted hover:text-ink"
                  aria-label={form.showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {form.showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </button>
              }
            />

            {form.formError ? (
              <p role="alert" className="flex items-start gap-2 rounded-2xl bg-risk-soft px-4 py-3 text-sm text-risk">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {form.formError}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={form.submitting}>
              {form.submitting ? 'Validando con el SII…' : 'Entrar'}
            </Button>
          </form>

        </GlassCard>
      </div>
    </div>
  )
}
