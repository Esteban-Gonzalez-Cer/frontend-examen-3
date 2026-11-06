import { ArrowLeft, Check, FolderOpen, Pencil, Trash2, X } from 'lucide-react'
import { Link } from 'react-router'

import { formatDateTime, formatNumber } from '@/shared/lib/format'
import { Badge, EmptyState, ErrorState, GlassCard, IconButton, LinkButton, PageHeader, Skeleton } from '@/shared/ui'
import { useScenariosPage } from '../hooks/useScenarioPages'

export function ScenariosPage() {
  const page = useScenariosPage()

  return (
    <>
      <PageHeader
        title="Escenarios guardados"
        subtitle="Cada escenario se recalcula con tu kardex actual al abrirlo."
        actions={
          <LinkButton to="/simulador" variant="light" icon={<ArrowLeft className="size-4" aria-hidden />}>
            Volver al simulador
          </LinkButton>
        }
      />

      {page.mutationError ? <p className="mb-4 rounded-2xl bg-risk-soft px-4 py-3 text-sm text-risk">{page.mutationError}</p> : null}

      {page.isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : page.isError ? (
        <ErrorState message={page.errorText ?? ''} onRetry={() => page.refetch()} />
      ) : page.items.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={<FolderOpen className="size-5" aria-hidden />}
            title="Aún no guardas escenarios"
            message="Prueba cambios en el simulador y guárdalos para compararlos después."
            action={
              <LinkButton to="/simulador" size="sm" className="mt-2">
                Ir al simulador
              </LinkButton>
            }
          />
        </GlassCard>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {page.items.map(({ scenario, delta, changes }) => {
            const editing = page.rename.editingId === scenario.id
            return (
              <li key={scenario.id}>
                <GlassCard as="article" className="flex h-full flex-col">
                  {editing ? (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        page.saveRename(scenario.id)
                      }}
                    >
                      <label className="sr-only" htmlFor={`rename-${scenario.id}`}>
                        Nuevo nombre
                      </label>
                      <input
                        id={`rename-${scenario.id}`}
                        value={page.rename.value}
                        onChange={(e) => page.rename.setValue(e.target.value)}
                        maxLength={120}
                        autoFocus
                        className="h-10 min-w-0 flex-1 rounded-xl bg-white px-3 ring-1 ring-ink/15 outline-none focus:ring-ink/50"
                      />
                      <IconButton label="Guardar nombre" size="sm" variant="dark" type="submit">
                        <Check className="size-4" aria-hidden />
                      </IconButton>
                      <IconButton label="Cancelar" size="sm" onClick={page.rename.stop}>
                        <X className="size-4" aria-hidden />
                      </IconButton>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/simulador/escenarios/${scenario.id}`} className="text-xl font-light hover:underline">
                        {scenario.name}
                      </Link>
                      <div className="flex shrink-0 gap-1">
                        <IconButton label="Renombrar" size="sm" onClick={() => page.rename.start(scenario.id, scenario.name)}>
                          <Pencil className="size-4" aria-hidden />
                        </IconButton>
                        <IconButton
                          label="Eliminar"
                          size="sm"
                          onClick={() => page.remove(scenario.id)}
                          disabled={page.removingId === scenario.id}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </IconButton>
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-sm text-muted">Egreso proyectado</p>
                  <p className="text-3xl font-extralight">{scenario.summary.projectedGraduationLabel ?? 'No alcanzable'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={delta.tone}>{delta.text}</Badge>
                    <Badge tone="outline">Promedio {formatNumber(scenario.summary.projectedGpa)}</Badge>
                    <Badge tone="none">{changes} cambio(s)</Badge>
                  </div>
                  <p className="mt-auto pt-4 text-xs text-muted">Actualizado {formatDateTime(scenario.updatedAt)}</p>
                </GlassCard>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
