import { ChevronDown, FileSearch } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatNumber, formatPct, toTitleCase } from '@/shared/lib/format'
import {
  Badge,
  CapsuleBars,
  CardHeader,
  EmptyState,
  ErrorState,
  GlassCard,
  PageHeader,
  SearchInput,
  Skeleton,
  StatNumber,
} from '@/shared/ui'
import { useKardexView } from '../hooks/useKardex'
import { descriptionLabel, gradeDisplay } from '../model/kardex'

export function KardexPage() {
  const view = useKardexView()

  return (
    <>
      <PageHeader title="Kardex" />

      {view.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-[var(--radius-card)]" />
          <Skeleton className="h-96 rounded-[var(--radius-card)]" />
        </div>
      ) : view.isError ? (
        <ErrorState message={view.errorText ?? ''} onRetry={() => view.refetch()} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <GlassCard className="flex flex-wrap items-center justify-between gap-6">
              <StatNumber value={view.data.accreditedCredits} label="Créditos acreditados" />
              <StatNumber value={formatPct(view.data.progressPct)} label="Avance de la carrera" />
              <StatNumber value={formatNumber(view.data.average)} label="Promedio" />
              <StatNumber value={view.data.approvedCount} label="Materias aprobadas" />
            </GlassCard>
            <GlassCard>
              <CardHeader title="Promedio por semestre" subtitle={`${view.data.failedCount} materias no acreditadas`} />
              <CapsuleBars bars={view.bars} min={60} max={100} height={120} />
            </GlassCard>
          </div>

          <SearchInput
            value={view.search}
            onChange={view.setSearch}
            placeholder="Buscar por materia, clave, periodo o semestre"
            className="mb-5 w-full sm:max-w-md"
          />

          {view.filtered.length === 0 ? (
            <GlassCard>
              <EmptyState icon={<FileSearch className="size-5" aria-hidden />} title="Sin resultados" message="Prueba con otra búsqueda." />
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {view.filtered.map((semester) => {
                const collapsed = view.isCollapsed(semester.semester)
                const panelId = `semester-${semester.semester}`
                return (
                  <GlassCard key={semester.semester} className="p-0 sm:p-0">
                    <button
                      type="button"
                      onClick={() => view.toggleSemester(semester.semester)}
                      aria-expanded={!collapsed}
                      aria-controls={panelId}
                      className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-grid size-10 place-items-center rounded-full bg-ink text-sm text-white">
                          {semester.semester}
                        </span>
                        <span className="text-xl font-light">Semestre {semester.semester}</span>
                      </span>
                      <span className="flex items-center gap-2 text-sm text-muted">
                        <Badge tone="outline">{semester.credits} créditos</Badge>
                        <Badge tone="accent">Promedio {formatNumber(semester.average)}</Badge>
                        <ChevronDown className={cn('size-5 transition', !collapsed && 'rotate-180')} aria-hidden />
                      </span>
                    </button>
                    {!collapsed ? (
                      <div id={panelId} className="overflow-x-auto px-2 pb-3 sm:px-4">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="text-xs text-muted">
                            <tr>
                              <th className="px-3 py-2 font-normal">Clave</th>
                              <th className="px-3 py-2 font-normal">Materia</th>
                              <th className="px-3 py-2 font-normal">Periodo</th>
                              <th className="px-3 py-2 text-right font-normal">Créditos</th>
                              <th className="px-3 py-2 text-right font-normal">Calificación</th>
                              <th className="px-3 py-2 font-normal">Tipo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {semester.entries.map((entry) => (
                              <tr key={`${entry.clave}-${entry.termCode}`} className="border-t border-dashed border-ink/10">
                                <td className="px-3 py-2.5 font-mono text-xs text-ink/70">{entry.clave}</td>
                                <td className="px-3 py-2.5">{toTitleCase(entry.name)}</td>
                                <td className="px-3 py-2.5 text-ink/80">{entry.termLabel}</td>
                                <td className="px-3 py-2.5 text-right tabular-nums">{entry.credits}</td>
                                <td className="px-3 py-2.5 text-right">
                                  <Badge tone={entry.accredited ? entry.level : 'risk'} className="tabular-nums">
                                    {gradeDisplay(entry)}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-muted">{descriptionLabel(entry.description)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </GlassCard>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
