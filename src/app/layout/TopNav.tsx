import { Clock, LogOut, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router'

import { useIsAdmin, useLogout, useSession, useSessionCountdown } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { formatCountdown, toTitleCase } from '@/shared/lib/format'
import { Avatar, IconButton } from '@/shared/ui'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calificaciones', label: 'Calificaciones' },
  { to: '/kardex', label: 'Kardex' },
  { to: '/horario', label: 'Horario' },
  { to: '/simulador', label: 'Simulador' },
]

export function TopNav() {
  const session = useSession()
  const isAdmin = useIsAdmin()
  const logout = useLogout()
  const remaining = useSessionCountdown()
  const lowTime = remaining < 5 * 60_000

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pt-4 sm:px-8 sm:pt-7 lg:px-10">
      <Link
        to="/dashboard"
        className="rounded-full border border-ink/50 px-5 py-1.5 text-2xl font-light tracking-tight sm:text-3xl"
      >
        SII
      </Link>

      <nav aria-label="Secciones" className="order-3 w-full lg:order-none lg:ml-auto lg:w-auto">
        <ul className="scroll-x flex gap-1 overflow-x-auto rounded-full bg-white/55 p-1.5 ring-1 ring-white/70">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to !== '/simulador'}
                className={({ isActive }) =>
                  cn(
                    'block rounded-full px-4 py-2 text-[15px] whitespace-nowrap transition',
                    isActive ? 'bg-ink text-white' : 'text-ink/85 hover:bg-white/80',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <span
          className={cn(
            'hidden h-11 items-center gap-2 rounded-full px-4 text-sm tabular-nums sm:inline-flex',
            lowTime ? 'bg-accent text-ink' : 'bg-white/55 text-ink/80',
          )}
          title="Tiempo restante de la sesión"
        >
          <Clock className="size-4" aria-hidden />
          <span className="sr-only">Sesión expira en</span>
          {formatCountdown(remaining)}
        </span>
        {isAdmin ? (
          <NavLink
            to="/admin/reticula"
            className={({ isActive }) =>
              cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] transition',
                isActive ? 'bg-ink text-white' : 'bg-white/55 hover:bg-white/80',
              )
            }
          >
            <Settings className="size-4" aria-hidden />
            <span className="hidden sm:inline">Admin</span>
          </NavLink>
        ) : null}
        {session ? (
          <Avatar
            name={toTitleCase(session.student.fullName)}
            className="size-11 text-sm font-medium"
          />
        ) : null}
        <IconButton label="Cerrar sesión" onClick={logout}>
          <LogOut className="size-4" aria-hidden />
        </IconButton>
      </div>
    </header>
  )
}
