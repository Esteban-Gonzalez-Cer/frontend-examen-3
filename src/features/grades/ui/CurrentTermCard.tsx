import { Check } from 'lucide-react'
import { Link } from 'react-router'

import { cn } from '@/shared/lib/cn'
import { formatNumber, toTitleCase } from '@/shared/lib/format'
import { GlassCard, Skeleton } from '@/shared/ui'
import { useCurrentTermGrades } from '../hooks/useGrades'
import { isPassing } from '../model/grades'

/** Dark list card, like the "Onboarding Task" card of the reference. */
export function CurrentTermCard() {
  const { current, summary, isPending, isError } = useCurrentTermGrades()

  if (isPending) return <Skeleton className="h-full min-h-80 rounded-[var(--radius-card)]" />
  if (isError || !current || !summary) {
    return (
      <GlassCard tone="dark" className="min-h-80">
        <p className="text-xl font-light">Semestre actual</p>
        <p className="mt-2 text-sm text-white/60">No hay materias en curso para mostrar.</p>
      </GlassCard>
    )
  }

  const progress = summary.capturedPct

  return (
    <GlassCard tone="dark" className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-light">Semestre actual</p>
          <p className="text-xs text-white/55">{current.termLabel}</p>
        </div>
        <p className="text-4xl font-extralight tabular-nums">
          {summary.gradedPartials}/{summary.totalPartials}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-label={`${progress}% de parciales capturados`}>
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>

      <ul className="mt-5 flex-1 space-y-3">
        {current.courses.map((course) => {
          const ok = isPassing(course)
          return (
            <li key={course.groupId} className="flex items-center gap-3">
              <span className="inline-grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-sm tabular-nums">
                {formatNumber(course.average)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{toTitleCase(course.name)}</p>
                <p className="text-xs text-white/50">
                  {course.clave} · {course.gradedCount} de {course.partials.length} parciales
                </p>
              </div>
              <span
                className={cn(
                  'inline-grid size-6 shrink-0 place-items-center rounded-full',
                  ok ? 'bg-accent text-ink' : 'bg-white/15',
                )}
                aria-label={ok ? 'Aprobando' : 'En riesgo o sin calificar'}
              >
                {ok ? <Check className="size-3.5" aria-hidden /> : null}
              </span>
            </li>
          )
        })}
      </ul>
      <Link to="/calificaciones" className="mt-5 text-sm text-accent hover:underline">
        Ver calificaciones →
      </Link>
    </GlassCard>
  )
}
