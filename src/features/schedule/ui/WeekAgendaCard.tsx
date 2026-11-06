import { Link } from 'react-router'

import { GlassCard, Skeleton } from '@/shared/ui'
import { useWeekSchedule } from '../hooks/useSchedule'
import { WeekGridView } from './WeekGridView'

/** Compact week agenda for the dashboard (the calendar card of the reference). */
export function WeekAgendaCard() {
  const view = useWeekSchedule()

  if (view.isPending) return <Skeleton className="h-full min-h-80 rounded-[var(--radius-card)]" />

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-white/80 px-3 py-1 text-sm">Esta semana</span>
        <p className="text-lg">{view.period?.termLabel ?? 'Horario'}</p>
        <Link to="/horario" className="rounded-full bg-white/80 px-3 py-1 text-sm hover:bg-white">
          Ver horario
        </Link>
      </div>
      {view.isError || !view.period ? (
        <p className="text-sm text-muted">No se pudo cargar el horario.</p>
      ) : (
        <WeekGridView grid={view.grid} hourHeight={34} compact />
      )}
    </GlassCard>
  )
}
