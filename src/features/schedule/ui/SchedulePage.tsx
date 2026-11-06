import { CalendarDays, Clock, MapPin } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatNumber, toTitleCase } from '@/shared/lib/format'
import { CardHeader, EmptyState, ErrorState, GlassCard, PageHeader, SegmentedControl, Skeleton } from '@/shared/ui'
import { useWeekSchedule } from '../hooks/useSchedule'
import { BLOCK_CLASSES, DOT_CLASSES } from './palette'
import { WeekGridView } from './WeekGridView'

export function SchedulePage() {
  const view = useWeekSchedule()

  return (
    <>
      <PageHeader
        title="Horario"
        subtitle={view.period ? `${view.period.termLabel} · ${view.period.description}` : 'Semestre actual'}
      />

      {view.isPending ? (
        <Skeleton className="h-[560px] rounded-[var(--radius-card)]" />
      ) : view.isError ? (
        <ErrorState message={view.errorText ?? ''} onRetry={() => view.refetch()} />
      ) : !view.period || view.grid.blocks.length === 0 ? (
        <GlassCard>
          <EmptyState icon={<CalendarDays className="size-5" aria-hidden />} title="No tienes clases registradas este periodo" />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <GlassCard className="hidden md:block">
            <WeekGridView grid={view.grid} />
          </GlassCard>

          {/* Mobile: one day at a time */}
          <GlassCard className="md:hidden">
            <div className="scroll-x -mx-1 mb-4 overflow-x-auto px-1">
              <SegmentedControl
                label="Día"
                size="sm"
                options={view.grid.days.map((d) => ({ value: d.key, label: d.short }))}
                value={view.day}
                onChange={view.setDay}
              />
            </div>
            {view.dayBlocks.length === 0 ? (
              <EmptyState title="Sin clases este día" />
            ) : (
              <ol className="space-y-3">
                {view.dayBlocks.map((block) => (
                  <li key={block.id} className={cn('rounded-2xl px-4 py-3', BLOCK_CLASSES[block.colorIndex])}>
                    <p className="text-sm">{toTitleCase(block.name)}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs opacity-75">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden />
                        {block.start}–{block.end}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" aria-hidden />
                        {block.room ?? 'Sin salón'}
                      </span>
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </GlassCard>

          <GlassCard as="aside">
            <CardHeader title="Materias" subtitle={`${view.grid.legend.length} grupos inscritos`} />
            <ul className="space-y-3">
              {view.grid.legend.map((course) => (
                <li key={course.clave} className="flex items-start gap-3">
                  <span className={cn('mt-1.5 size-3 shrink-0 rounded-full', DOT_CLASSES[course.colorIndex])} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm">{toTitleCase(course.name)}</p>
                    <p className="text-xs text-muted">
                      {course.clave} · Grupo {course.groupLetter} · {formatNumber(course.weeklyHours)} h/semana
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}
    </>
  )
}
