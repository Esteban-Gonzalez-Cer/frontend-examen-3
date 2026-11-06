import { Pencil, Plus, Trash2 } from 'lucide-react'

import { toTitleCase } from '@/shared/lib/format'
import {
  Badge,
  Button,
  CardHeader,
  Dialog,
  ErrorState,
  GlassCard,
  IconButton,
  PageHeader,
  SearchInput,
  SegmentedControl,
  SelectField,
  Skeleton,
  TextField,
} from '@/shared/ui'
import { useAdminTabs, useRequisitesPanel, useRulesPanel, useSubjectsPanel } from '../hooks/useAdmin'
import { KIND_LABEL, KIND_TONE } from '../model/forms'
import type { AdminTab, SubjectKind } from '../model/types'

const TABS: { value: AdminTab; label: string }[] = [
  { value: 'subjects', label: 'Materias' },
  { value: 'requisites', label: 'Requisitos' },
  { value: 'rules', label: 'Reglas de carga' },
]

export function AdminCurriculumPage() {
  const { tab, setTab } = useAdminTabs()
  return (
    <>
      <PageHeader
        title="Administración de la retícula"
        subtitle="Backend de administración del What-If Simulator: materias, requisitos (aristas del DAG) y reglas."
        actions={<SegmentedControl label="Sección" options={TABS} value={tab} onChange={setTab} />}
      />
      {tab === 'subjects' ? <SubjectsPanel /> : tab === 'requisites' ? <RequisitesPanel /> : <RulesPanel />}
    </>
  )
}

// --------------------------------------------------------------------------- subjects

function SubjectsPanel() {
  const panel = useSubjectsPanel()

  if (panel.isPending) return <Skeleton className="h-96 rounded-[var(--radius-card)]" />
  if (panel.isError) return <ErrorState message={panel.error.message} onRetry={() => panel.refetch()} />

  const editing = panel.editing
  return (
    <GlassCard>
      <CardHeader
        title={`${panel.count} materias`}
        subtitle={`${panel.totalCredits} créditos en total`}
        action={
          <Button size="sm" onClick={panel.startCreate} icon={<Plus className="size-4" aria-hidden />}>
            Nueva materia
          </Button>
        }
      />
      <SearchInput value={panel.search} onChange={panel.setSearch} placeholder="Buscar por clave, nombre o semestre" className="mb-4 max-w-md" />
      {panel.removeError ? <p className="mb-3 rounded-2xl bg-risk-soft px-4 py-2 text-sm text-risk">{panel.removeError}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-normal">Clave</th>
              <th className="px-3 py-2 font-normal">Materia</th>
              <th className="px-3 py-2 text-right font-normal">Créditos</th>
              <th className="px-3 py-2 text-right font-normal">Sem.</th>
              <th className="px-3 py-2 font-normal">Tipo</th>
              <th className="px-3 py-2 text-right font-normal">% créditos</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {panel.filtered.map((subject) => (
              <tr key={subject.clave} className="border-t border-dashed border-ink/10">
                <td className="px-3 py-2 font-mono text-xs">{subject.clave}</td>
                <td className="px-3 py-2">{subject.name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{subject.credits}</td>
                <td className="px-3 py-2 text-right tabular-nums">{subject.suggestedSemester}</td>
                <td className="px-3 py-2">
                  <Badge tone={KIND_TONE[subject.kind]}>
                    {KIND_LABEL[subject.kind]}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{subject.minCreditPct ?? '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`Editar ${subject.clave}`} size="sm" onClick={() => panel.startEdit(subject)}>
                      <Pencil className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton
                      label={`Eliminar ${subject.clave}`}
                      size="sm"
                      disabled={panel.removingClave === subject.clave}
                      onClick={() => panel.remove(subject.clave)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={editing !== null}
        onClose={panel.cancel}
        title={editing?.mode === 'create' ? 'Nueva materia' : `Editar ${editing?.values.clave ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={panel.cancel}>
              Cancelar
            </Button>
            <Button onClick={panel.submit} disabled={panel.saving}>
              {panel.saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {editing ? (
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              panel.submit()
            }}
          >
            <TextField
              label="Clave"
              value={editing.values.clave}
              disabled={editing.mode === 'edit'}
              onChange={(e) => panel.setField('clave', e.target.value)}
              error={panel.errors.clave}
            />
            <SelectField label="Tipo" value={editing.values.kind} onChange={(e) => panel.setField('kind', e.target.value as SubjectKind)}>
              {Object.entries(KIND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <TextField
              className="col-span-2"
              label="Nombre"
              value={editing.values.name}
              onChange={(e) => panel.setField('name', e.target.value)}
              error={panel.errors.name}
            />
            <TextField label="Créditos" inputMode="numeric" value={editing.values.credits} onChange={(e) => panel.setField('credits', e.target.value)} error={panel.errors.credits} />
            <TextField label="Semestre sugerido" inputMode="numeric" value={editing.values.suggestedSemester} onChange={(e) => panel.setField('suggestedSemester', e.target.value)} error={panel.errors.suggestedSemester} />
            <TextField label="Horas teoría" inputMode="numeric" value={editing.values.ht} onChange={(e) => panel.setField('ht', e.target.value)} error={panel.errors.ht} />
            <TextField label="Horas práctica" inputMode="numeric" value={editing.values.hp} onChange={(e) => panel.setField('hp', e.target.value)} error={panel.errors.hp} />
            <TextField label="Fila en la retícula" inputMode="numeric" value={editing.values.gridRow} onChange={(e) => panel.setField('gridRow', e.target.value)} error={panel.errors.gridRow} />
            <TextField label="Columna (semestre)" inputMode="numeric" value={editing.values.gridCol} onChange={(e) => panel.setField('gridCol', e.target.value)} error={panel.errors.gridCol} />
            <TextField
              label="% de créditos requerido"
              inputMode="decimal"
              placeholder="Opcional"
              value={editing.values.minCreditPct}
              onChange={(e) => panel.setField('minCreditPct', e.target.value)}
              error={panel.errors.minCreditPct}
            />
            <label className="flex items-center gap-2 self-end pb-3 text-sm">
              <input
                type="checkbox"
                checked={editing.values.countsTowardLoad}
                onChange={(e) => panel.setField('countsTowardLoad', e.target.checked)}
                className="size-4 accent-[#1f1f1f]"
              />
              Cuenta en la carga
            </label>
            {panel.saveError ? <p className="col-span-2 text-sm text-risk">{panel.saveError}</p> : null}
            <button type="submit" className="hidden" />
          </form>
        ) : null}
      </Dialog>
    </GlassCard>
  )
}

// --------------------------------------------------------------------------- requisites

function RequisitesPanel() {
  const panel = useRequisitesPanel()

  if (panel.isPending) return <Skeleton className="h-96 rounded-[var(--radius-card)]" />
  if (panel.isError) return <ErrorState message={panel.errorText ?? ''} onRetry={panel.refetch} />

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
      <GlassCard>
        <CardHeader title={`${panel.rows.length} requisitos`} subtitle="Cada fila es una arista del grafo: materia ← requisito." />
        <SearchInput value={panel.search} onChange={panel.setSearch} placeholder="Buscar materia o requisito" className="mb-4 max-w-md" />
        <ul className="divide-y divide-dashed divide-ink/10">
          {panel.rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="block">{toTitleCase(row.subjectName)}</span>
                <span className="block text-xs text-muted">
                  {row.type === 'prereq' ? 'requiere' : 'co-requisito'} {toTitleCase(row.requiresName)} ({row.requiresClave})
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge tone={row.type === 'prereq' ? 'outline' : 'accent'}>{row.type === 'prereq' ? 'Prerrequisito' : 'Co-requisito'}</Badge>
                <IconButton label="Eliminar requisito" size="sm" disabled={panel.removingId === row.id} onClick={() => panel.remove(row.id)}>
                  <Trash2 className="size-4" aria-hidden />
                </IconButton>
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard as="aside" className="h-fit">
        <CardHeader title="Agregar requisito" subtitle="Se rechaza si crea un ciclo en la retícula." />
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            panel.submit()
          }}
        >
          <SelectField label="Materia" value={panel.form.subjectClave} onChange={(e) => panel.setForm({ subjectClave: e.target.value })}>
            <option value="">Elige una materia</option>
            {panel.subjects.map((s) => (
              <option key={s.clave} value={s.clave}>
                {s.clave} · {s.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Requiere" value={panel.form.requiresClave} onChange={(e) => panel.setForm({ requiresClave: e.target.value })}>
            <option value="">Elige el requisito</option>
            {panel.subjects.map((s) => (
              <option key={s.clave} value={s.clave}>
                {s.clave} · {s.name}
              </option>
            ))}
          </SelectField>
          <SegmentedControl
            label="Tipo de requisito"
            size="sm"
            options={[
              { value: 'prereq', label: 'Prerrequisito' },
              { value: 'coreq', label: 'Co-requisito' },
            ]}
            value={panel.form.type}
            onChange={(type) => panel.setForm({ type })}
          />
          {panel.formError ? (
            <p role="alert" className="rounded-2xl bg-risk-soft px-4 py-2 text-sm text-risk">
              {panel.formError}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={panel.adding} icon={<Plus className="size-4" aria-hidden />}>
            {panel.adding ? 'Agregando…' : 'Agregar'}
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}

// --------------------------------------------------------------------------- rules

function RulesPanel() {
  const panel = useRulesPanel()

  if (panel.isPending || !panel.values) return <Skeleton className="h-72 max-w-xl rounded-[var(--radius-card)]" />
  if (panel.isError) return <ErrorState message={panel.error.message} onRetry={() => panel.refetch()} />

  const fields: { key: keyof typeof panel.values; label: string }[] = [
    { key: 'maxCreditsPerTerm', label: 'Carga máxima por semestre (créditos)' },
    { key: 'minCreditsPerTerm', label: 'Carga mínima por semestre (créditos)' },
    { key: 'summerMaxSubjects', label: 'Materias máximas en verano' },
    { key: 'passingGrade', label: 'Calificación aprobatoria' },
  ]

  return (
    <GlassCard className="max-w-xl">
      <CardHeader title="Reglas de carga académica" subtitle="El simulador las usa para proyectar tu plan." />
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          panel.submit()
        }}
      >
        {fields.map((field) => (
          <TextField
            key={field.key}
            label={field.label}
            inputMode="numeric"
            value={panel.values?.[field.key] ?? ''}
            onChange={(e) => panel.setField(field.key, e.target.value)}
            error={panel.errors[field.key]}
          />
        ))}
        {panel.saveError ? <p className="text-sm text-risk">{panel.saveError}</p> : null}
        {panel.saved ? <p className="text-sm text-good">Reglas guardadas.</p> : null}
        <Button type="submit" disabled={panel.saving}>
          {panel.saving ? 'Guardando…' : 'Guardar reglas'}
        </Button>
      </form>
    </GlassCard>
  )
}
