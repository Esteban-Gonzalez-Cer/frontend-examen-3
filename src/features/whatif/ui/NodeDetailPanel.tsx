import { X } from 'lucide-react'
import type { Dispatch } from 'react'

import { toTitleCase } from '@/shared/lib/format'
import { Badge, GlassCard, IconButton, KeyValue, SegmentedControl, SelectField } from '@/shared/ui'
import { STATUS_LABEL, STATUS_TONE, type NodeDetail } from '../model/presentation'
import { draftActions, type DraftAction } from '../model/scenarioDraft'
import type { Outcome } from '../model/types'

interface NodeDetailPanelProps {
  detail: NodeDetail
  dispatch: Dispatch<DraftAction>
  outcome: Outcome
  termOptions: { code: string; label: string }[]
  onClose: () => void
}

export function NodeDetailPanel({ detail, dispatch, outcome, termOptions, onClose }: NodeDetailPanelProps) {
  const { node } = detail
  return (
    <GlassCard as="aside" aria-label={`Detalle de ${node.name}`} className="border-2 border-ink/80">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{node.clave}</p>
          <h2 className="text-xl leading-snug font-light">{toTitleCase(node.name)}</h2>
        </div>
        <IconButton label="Cerrar detalle" size="sm" onClick={onClose}>
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={STATUS_TONE[node.status]}>
          {STATUS_LABEL[node.status]}
        </Badge>
        {node.onCriticalPath ? <Badge tone="accent">Ruta crítica</Badge> : null}
      </div>
      <div className="text-sm">
        <KeyValue label="Créditos" value={node.credits} />
        <KeyValue label="Semestre sugerido" value={node.suggestedSemester} />
        {node.gradeLabel ? <KeyValue label="Calificación" value={node.gradeLabel} /> : null}
        {node.plannedLabel ? <KeyValue label="Programada en" value={node.plannedLabel} /> : null}
        {node.slack !== null ? <KeyValue label="Holgura" value={`${node.slack} periodo(s)`} /> : null}
        {node.minCreditPct !== null ? <KeyValue label="Requiere créditos" value={`${node.minCreditPct}%`} /> : null}
      </div>

      {detail.prerequisites.length ? (
        <div className="mt-4">
          <p className="mb-1 text-xs text-muted">Requiere</p>
          <ul className="flex flex-wrap gap-1.5">
            {detail.prerequisites.map((p) => (
              <li key={p.clave}>
                <Badge tone={p.status === 'approved' ? 'ink' : 'outline'}>
                  {toTitleCase(p.name)}
                  {p.type === 'coreq' ? ' (co-req.)' : ''}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {detail.dependents.length ? (
        <div className="mt-3">
          <p className="mb-1 text-xs text-muted">Desbloquea</p>
          <ul className="flex flex-wrap gap-1.5">
            {detail.dependents.map((d) => (
              <li key={d.clave}>
                <Badge tone="outline">{toTitleCase(d.name)}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail.canSimulateOutcome ? (
        <div className="mt-4">
          <p className="mb-2 text-sm">¿Qué pasa si…?</p>
          <SegmentedControl
            label="Resultado simulado"
            size="sm"
            options={[
              { value: 'pass', label: 'La apruebo' },
              { value: 'fail', label: 'La repruebo' },
            ]}
            value={outcome}
            onChange={(value) => dispatch(draftActions.outcome(node.clave, value))}
          />
        </div>
      ) : null}

      {detail.canPostpone ? (
        <SelectField
          className="mt-4"
          label="Posponer hasta"
          value={detail.postponedTo ?? ''}
          onChange={(e) => dispatch(draftActions.postpone(node.clave, e.target.value))}
        >
          <option value="">Lo antes posible</option>
          {termOptions.map((t) => (
            <option key={t.code} value={t.code}>
              {t.label}
            </option>
          ))}
        </SelectField>
      ) : null}
    </GlassCard>
  )
}
