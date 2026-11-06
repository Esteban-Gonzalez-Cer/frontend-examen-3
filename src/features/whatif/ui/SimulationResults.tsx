import { AlertTriangle, Flag, Zap } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatNumber, formatPct, toTitleCase } from '@/shared/lib/format'
import { Badge, CardHeader, GlassCard, StatNumber } from '@/shared/ui'
import { BOTTLENECK_LABEL, deltaBadge, gateMarkers, gateStatusText, impactBadge, REASON_LABEL } from '../model/presentation'
import type { SimulationResult } from '../model/types'

export function ResultsHeader({ result, updating }: { result: SimulationResult; updating?: boolean }) {
  const delta = deltaBadge(result.deltaVsBaseline)
  return (
    <section className={cn('grid gap-6 transition-opacity lg:grid-cols-[1.3fr_1fr]', updating && 'opacity-60')} aria-live="polite">
      <div>
        <p className="text-sm text-muted">Egreso proyectado</p>
        <p className="mt-1 text-5xl font-extralight tracking-tight sm:text-6xl">
          {result.projectedGraduationLabel ?? 'No alcanzable'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={delta.tone} className="px-3 py-1 text-sm">
            {delta.text}
          </Badge>
          <Badge tone="outline" className="px-3 py-1 text-sm">
            Periodo actual: {result.currentTermLabel}
          </Badge>
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6 lg:justify-end lg:gap-10">
        <StatNumber value={result.termsRemaining ?? '—'} label="Periodos restantes" />
        <StatNumber value={formatNumber(result.gpa.projected)} label="Promedio proyectado" />
        <StatNumber value={formatPct(result.credits.afterCurrentPct)} label="Avance al cerrar el periodo" />
      </div>
    </section>
  )
}

export function CriticalPathCard({ result }: { result: SimulationResult }) {
  return (
    <GlassCard>
      <CardHeader title="Ruta crítica" subtitle="La cadena que determina tu fecha de egreso." />
      {result.criticalPath.length === 0 ? (
        <p className="text-sm text-muted">No quedan materias por programar después del periodo actual.</p>
      ) : (
        <ol className="relative space-y-4 border-l-2 border-dashed border-accent-strong/60 pl-5">
          {result.criticalPath.map((step) => (
            <li key={step.clave} className="relative">
              <span className="absolute top-1.5 -left-[27px] size-3 rounded-full bg-accent ring-4 ring-[#f5f1f5]" aria-hidden />
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px]">{toTitleCase(step.name)}</p>
                <Badge tone="ink">{step.termLabel}</Badge>
                <Badge tone="outline">{REASON_LABEL[step.reason]}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted">{step.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </GlassCard>
  )
}

export function BottlenecksCard({ result }: { result: SimulationResult }) {
  return (
    <GlassCard tone="dark">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-light">Cuellos de botella</p>
          <p className="text-sm text-white/55">Materias que más condicionan tu avance.</p>
        </div>
        <p className="text-4xl font-extralight">{result.bottlenecks.length}</p>
      </div>
      {result.bottlenecks.length === 0 ? (
        <p className="text-sm text-white/60">No se detectaron cuellos de botella.</p>
      ) : (
        <ul className="space-y-3">
          {result.bottlenecks.map((b) => (
            <li key={`${b.kind}-${b.clave}`} className="flex items-start gap-3">
              <span
                className={cn(
                  'inline-grid size-10 shrink-0 place-items-center rounded-full',
                  b.kind === 'hidden' ? 'bg-accent text-ink' : 'bg-white/10',
                )}
                aria-hidden
              >
                {b.kind === 'hidden' ? <Zap className="size-4" /> : b.kind === 'gate' ? <Flag className="size-4" /> : <AlertTriangle className="size-4" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm">
                  {toTitleCase(b.name)}{' '}
                  <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{BOTTLENECK_LABEL[b.kind]}</span>
                </p>
                <p className="mt-0.5 text-xs text-white/55">{b.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}

export function PlanTimeline({ result }: { result: SimulationResult }) {
  return (
    <GlassCard>
      <CardHeader title="Plan proyectado" subtitle="Materias por periodo según tus reglas de carga." />
      {result.plan.length === 0 ? (
        <p className="text-sm text-muted">Terminas todo al cerrar {result.currentTermLabel}.</p>
      ) : (
        <div className="scroll-x -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {result.plan.map((term) => (
            <section key={term.term} className="w-64 shrink-0 rounded-2xl bg-white/60 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-lg">{term.label}</p>
                <span className="text-xs text-muted">{term.loadCredits} cr.</span>
              </div>
              {term.subjects.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Sin materias.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {term.subjects.map((s) => (
                    <li key={s.clave} className={cn('rounded-xl px-3 py-2 text-sm', s.isRetake ? 'bg-risk-soft text-risk' : 'bg-white')}>
                      <p className="leading-snug">{toTitleCase(s.name)}</p>
                      <p className="text-[11px] opacity-70">
                        {s.clave} · {s.credits} créditos{s.isRetake ? ' · recursamiento' : ''}
                        {!s.countsTowardLoad ? ' · no cuenta en carga' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted">Acumulado: {term.creditsAfter} créditos</p>
            </section>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

export function GateTimeline({ result }: { result: SimulationResult }) {
  const markers = gateMarkers(result)
  return (
    <GlassCard>
      <CardHeader
        title="Umbrales de créditos"
        subtitle={`${result.credits.approved} de ${result.credits.total} créditos aprobados · ${result.credits.afterCurrentTerm} al cerrar el periodo`}
      />
      <div className="relative mt-10 mb-2 h-12">
        <div className="stripes absolute inset-0 rounded-full border border-ink/10" />
        <div className="absolute inset-y-0 left-0 rounded-full bg-accent/80" style={{ width: `${result.credits.afterCurrentPct}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${result.credits.approvedPct}%` }} />
        {markers.map((m) => (
          <div key={m.pct} className="absolute -top-8 flex -translate-x-1/2 flex-col items-center" style={{ left: `${m.leftPct}%` }}>
            <span className={cn('rounded-full px-1.5 text-[11px]', m.reachedNow ? 'bg-ink text-white' : 'bg-white text-ink')}>{m.pct}%</span>
            <span className="h-14 w-px bg-ink/40" aria-hidden />
          </div>
        ))}
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {markers.map((m) => (
          <li key={m.pct} className="flex items-start gap-3 rounded-2xl bg-white/50 px-3 py-2 text-sm">
            <span className="w-10 shrink-0 font-medium">{m.pct}%</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{m.subjects.join(', ')}</span>
              <span className="text-xs text-muted">
                {gateStatusText(m)} · {m.creditsNeeded} créditos
              </span>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}

export function FailureImpactCard({ result }: { result: SimulationResult }) {
  if (result.failureImpact.length === 0) return null
  return (
    <GlassCard>
      <CardHeader title="¿Y si…?" subtitle="Impacto en tu egreso de reprobar o posponer cada materia." />
      <ul className="divide-y divide-dashed divide-ink/10">
        {result.failureImpact.map((impact) => {
          const badge = impactBadge(impact)
          return (
            <li key={`${impact.scenario}-${impact.clave}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span>
                {impact.scenario === 'fail' ? 'Reprobar' : 'Posponer'} <span className="text-ink">{toTitleCase(impact.name)}</span>
              </span>
              <Badge tone={badge.tone}>{badge.text}</Badge>
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}

export function WarningsList({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return (
    <ul className="space-y-2" role="status">
      {warnings.map((warning) => (
        <li key={warning} className="flex items-start gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {warning}
        </li>
      ))}
    </ul>
  )
}

/** Shared by the live simulator and a saved scenario's detail view. */
export function SimulationResults({ result }: { result: SimulationResult }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <CriticalPathCard result={result} />
        <BottlenecksCard result={result} />
      </div>
      <PlanTimeline result={result} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <GateTimeline result={result} />
        <FailureImpactCard result={result} />
      </div>
    </div>
  )
}
