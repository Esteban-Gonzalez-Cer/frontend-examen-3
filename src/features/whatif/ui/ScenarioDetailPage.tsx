import { ArrowLeft, Play } from 'lucide-react'

import { Button, ErrorState, LinkButton, PageHeader, Skeleton } from '@/shared/ui'
import { useScenarioDetailPage } from '../hooks/useScenarioPages'
import { ResultsHeader, SimulationResults, WarningsList } from './SimulationResults'

export function ScenarioDetailPage() {
  const page = useScenarioDetailPage()

  return (
    <>
      <PageHeader
        title={page.data?.scenario.name ?? 'Escenario'}
        subtitle="Recalculado con tu kardex y calificaciones actuales."
        actions={
          <>
            <LinkButton to="/simulador/escenarios" variant="light" icon={<ArrowLeft className="size-4" aria-hidden />}>
              Escenarios
            </LinkButton>
            <Button onClick={page.openInSimulator} disabled={!page.data} icon={<Play className="size-4" aria-hidden />}>
              Abrir en el simulador
            </Button>
          </>
        }
      />
      {page.isPending ? (
        <Skeleton className="h-96 rounded-[var(--radius-card)]" />
      ) : page.isError || !page.data ? (
        <ErrorState message={page.errorText ?? 'No se encontró el escenario.'} onRetry={() => page.refetch()} />
      ) : (
        <div className="space-y-6">
          <ResultsHeader result={page.data.result} />
          <WarningsList warnings={page.data.result.warnings} />
          <SimulationResults result={page.data.result} />
        </div>
      )}
    </>
  )
}
