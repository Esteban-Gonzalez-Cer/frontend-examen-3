import { FolderOpen, LoaderCircle, Network } from 'lucide-react'

import { Button, CardHeader, Dialog, ErrorState, GlassCard, LinkButton, PageHeader, Skeleton, Spinner, TextField } from '@/shared/ui'
import { useSimulatorPage } from '../hooks/useSimulatorPage'
import { CurriculumGraph, GraphLegend } from './CurriculumGraph'
import { NodeDetailPanel } from './NodeDetailPanel'
import { ScenarioControls } from './ScenarioControls'
import { ResultsHeader, SimulationResults, WarningsList } from './SimulationResults'

export function SimulatorPage() {
  const page = useSimulatorPage()

  return (
    <>
      <PageHeader
        title="Simulador What-If"
        actions={
          <LinkButton to="/simulador/escenarios" variant="light" icon={<FolderOpen className="size-4" aria-hidden />}>
            Escenarios guardados
          </LinkButton>
        }
      />

      {page.isInitialLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 max-w-2xl" />
          <Skeleton className="h-[600px] rounded-[var(--radius-card)]" />
        </div>
      ) : !page.result ? (
        <ErrorState message={page.errorText ?? 'No se pudo calcular el análisis.'} onRetry={() => page.retry()} />
      ) : (
        <div className="space-y-6">
          <ResultsHeader result={page.result} updating={page.isUpdating} />
          {page.errorText ? <ErrorState title="No se pudo simular este escenario" message={page.errorText} onRetry={() => page.retry()} /> : null}
          <WarningsList warnings={page.result.warnings} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
            <GlassCard className="flex min-w-0 flex-col">
              <CardHeader
                title="Retícula"
                subtitle="Toca una materia para ver sus requisitos y simular qué pasa si la repruebas o pospones."
                action={
                  page.isUpdating ? (
                    <Spinner label="Recalculando…" />
                  ) : (
                    <Network className="size-5 text-muted" aria-hidden />
                  )
                }
              />
              <CurriculumGraph nodes={page.result.nodes} edges={page.result.edges} selected={page.selected} onSelect={page.select} />
              <div className="mt-4">
                <GraphLegend />
              </div>
            </GlassCard>

            <div className="space-y-4">
              {page.detail ? (
                <NodeDetailPanel
                  detail={page.detail}
                  dispatch={page.dispatch}
                  outcome={page.outcomeOf(page.detail.node.clave)}
                  termOptions={page.termOptions}
                  onClose={() => page.select(null)}
                />
              ) : null}
              <ScenarioControls
                draft={page.draft}
                dispatch={page.dispatch}
                current={page.current}
                outcomeOf={page.outcomeOf}
                changes={page.changes}
                defaultMaxCredits={page.maxCreditsDefault}
                onSave={page.saveDialog.openDialog}
              />
            </div>
          </div>

          <SimulationResults result={page.result} />
        </div>
      )}

      <Dialog
        open={page.saveDialog.open}
        onClose={page.saveDialog.close}
        title="Guardar escenario"
        footer={
          <>
            <Button variant="ghost" onClick={page.saveDialog.close}>
              Cancelar
            </Button>
            <Button
              onClick={page.saveDialog.save}
              disabled={!page.saveDialog.name.trim() || page.saveDialog.saving}
              icon={page.saveDialog.saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : undefined}
            >
              Guardar
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            page.saveDialog.save()
          }}
        >
          <TextField
            label="Nombre del escenario"
            placeholder="Ej. Iniciar servicio social en enero"
            maxLength={120}
            value={page.saveDialog.name}
            onChange={(e) => page.saveDialog.setName(e.target.value)}
            error={page.saveDialog.error ?? undefined}
            data-autofocus
          />
          <p className="mt-2 text-xs text-muted">Se guarda en nuestra base de datos y se recalcula con tu kardex cada vez que lo abras.</p>
        </form>
      </Dialog>
    </>
  )
}
