import { RotateCcw, Save } from 'lucide-react'
import type { Dispatch } from 'react'

import { toTitleCase } from '@/shared/lib/format'
import { Button, CardHeader, GlassCard, SegmentedControl, Toggle } from '@/shared/ui'
import { SERVICIO_SOCIAL_OPTIONS } from '../model/presentation'
import { draftActions, type DraftAction } from '../model/scenarioDraft'
import type { GraphNode, Outcome, ScenarioParams } from '../model/types'

interface ScenarioControlsProps {
  draft: ScenarioParams
  dispatch: Dispatch<DraftAction>
  current: GraphNode[]
  outcomeOf: (clave: string) => Outcome
  changes: number
  defaultMaxCredits: number
  onSave: () => void
}

const OUTCOME_OPTIONS: { value: Outcome; label: string }[] = [
  { value: 'pass', label: 'Aprobar' },
  { value: 'fail', label: 'Reprobar' },
]

export function ScenarioControls({
  draft,
  dispatch,
  current,
  outcomeOf,
  changes,
  defaultMaxCredits,
  onSave,
}: ScenarioControlsProps) {
  const maxCredits = draft.maxCreditsPerTerm ?? defaultMaxCredits

  return (
    <GlassCard className="flex flex-col gap-5">
      <CardHeader
        className="mb-0"
        title="Escenario"
        subtitle={changes ? `${changes} cambio(s) respecto a tu ruta actual` : 'Tu ruta actual (sin cambios)'}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'reset' })}
            disabled={!changes}
            icon={<RotateCcw className="size-4" aria-hidden />}
          >
            Restablecer
          </Button>
        }
      />

      <div>
        <label htmlFor="max-credits" className="flex items-baseline justify-between text-[15px]">
          Carga máxima por semestre
          <span className="text-2xl font-light tabular-nums">{maxCredits}</span>
        </label>
        <input
          id="max-credits"
          type="range"
          min={8}
          max={40}
          step={1}
          value={maxCredits}
          onChange={(e) => dispatch(draftActions.maxCredits(Number(e.target.value), defaultMaxCredits))}
          className="mt-2 w-full accent-[#1f1f1f]"
        />
        <p className="text-xs text-muted">Reglamento: {defaultMaxCredits} créditos máximo.</p>
      </div>

      <Toggle
        label="Incluir cursos de verano"
        description="Hasta 2 materias regulares por verano."
        checked={draft.includeSummer}
        onChange={(value) => dispatch({ type: 'setSummer', value })}
      />

      <div>
        <p className="mb-2 text-[15px]">Servicio Social</p>
        <SegmentedControl
          label="Estado del Servicio Social"
          size="sm"
          options={SERVICIO_SOCIAL_OPTIONS}
          value={draft.servicioSocial}
          onChange={(value) => dispatch({ type: 'setServicioSocial', value })}
        />
      </div>

      {current.length ? (
        <div>
          <p className="mb-1 text-[15px]">Materias en curso</p>
          <p className="mb-3 text-xs text-muted">Simula el resultado o escribe una calificación final hipotética.</p>
          <ul className="space-y-3">
            {current.map((subject) => (
              <li key={subject.clave} className="rounded-2xl bg-white/60 p-3">
                <p className="text-sm leading-snug">{toTitleCase(subject.name)}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <SegmentedControl
                    label={`Resultado de ${subject.name}`}
                    size="sm"
                    options={OUTCOME_OPTIONS}
                    value={outcomeOf(subject.clave)}
                    onChange={(outcome) => dispatch(draftActions.outcome(subject.clave, outcome))}
                  />
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Final
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={100}
                      placeholder="—"
                      value={draft.grades[subject.clave] ?? ''}
                      onChange={(e) => dispatch(draftActions.grade(subject.clave, e.target.value))}
                      className="h-9 w-16 rounded-xl bg-white px-2 text-center text-sm text-ink ring-1 ring-ink/10 outline-none focus:ring-ink/40"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button variant="dark" onClick={onSave} icon={<Save className="size-4" aria-hidden />}>
        Guardar escenario
      </Button>
    </GlassCard>
  )
}
