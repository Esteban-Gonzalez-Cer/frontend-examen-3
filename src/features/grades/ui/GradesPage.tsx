import { BookOpen } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { EmptyState, ErrorState, GlassCard, PageHeader, SearchInput, SegmentedControl, Skeleton } from '@/shared/ui'
import { useGradesView } from '../hooks/useGrades'
import type { LevelFilter } from '../model/types'
import { CourseCard } from './CourseCard'
import { PerformanceSemaphore } from './PerformanceSemaphore'

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'good', label: '≥ 85' },
  { value: 'warning', label: '70–84' },
  { value: 'risk', label: '< 70' },
]

export function GradesPage() {
  const view = useGradesView()

  return (
    <>
      <PageHeader
        title="Calificaciones"
        subtitle={view.current ? `${view.current.termLabel} · ${view.current.description}` : 'Periodo actual'}
      />

      {view.isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : view.isError ? (
        <ErrorState message={view.errorText ?? ''} onRetry={() => view.refetch()} />
      ) : (
        <>
          {view.summary ? (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard className="flex flex-col justify-between">
                <p className="text-sm text-muted">Promedio parcial del periodo</p>
                <p className="mt-2 text-6xl font-extralight">{formatNumber(view.summary.average)}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-sm text-muted">Parciales capturados</p>
                <p className="mt-2 text-6xl font-extralight">
                  {view.summary.gradedPartials}
                  <span className="text-2xl text-muted">/{view.summary.totalPartials}</span>
                </p>
              </GlassCard>
              <PerformanceSemaphore
                className="sm:col-span-2"
                counts={view.summary.counts}
                active={view.level}
                onSelect={view.setLevel}
              />
            </div>
          ) : null}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={view.search}
              onChange={view.setSearch}
              placeholder="Buscar por materia, clave o periodo"
              className="w-full sm:max-w-md"
            />
            <SegmentedControl label="Filtrar por desempeño" options={LEVEL_OPTIONS} value={view.level} onChange={view.setLevel} />
          </div>

          {view.filtered.length === 0 ? (
            <GlassCard>
              <EmptyState
                icon={<BookOpen className="size-5" aria-hidden />}
                title={view.periods.length ? 'Sin resultados' : 'No hay calificaciones en este periodo'}
                message={view.periods.length ? 'Prueba con otro nombre, clave o periodo.' : undefined}
              />
            </GlassCard>
          ) : (
            view.filtered.map((period) => (
              <section key={period.termCode} aria-label={period.termLabel} className="mb-8">
                {view.filtered.length > 1 ? <h2 className="mb-3 text-xl font-light">{period.termLabel}</h2> : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {period.courses.map((course) => (
                    <CourseCard key={course.groupId} course={course} termLabel={period.termLabel} />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </>
  )
}
