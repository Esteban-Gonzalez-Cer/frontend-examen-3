import { useNavigate, useParams } from 'react-router'

import { errorMessage } from '@/shared/api/errors'
import { deltaBadge } from '../model/presentation'
import { countChanges } from '../model/scenarioDraft'
import type { Scenario } from '../model/types'
import { useRenameState, useScenarioDetail, useScenarios } from './useScenarios'

export function useScenariosPage() {
  const { list, update, remove } = useScenarios()
  const rename = useRenameState()

  const items = (list.data ?? []).map((scenario: Scenario) => ({
    scenario,
    delta: deltaBadge(scenario.summary.deltaVsBaseline),
    changes: countChanges(scenario.params),
  }))

  return {
    ...list,
    items,
    errorText: list.error ? errorMessage(list.error) : null,
    rename,
    saveRename: (id: string) => {
      const name = rename.value.trim()
      if (!name) return
      update.mutate({ id, name }, { onSuccess: rename.stop })
    },
    remove: (id: string) => remove.mutate(id),
    removingId: remove.isPending ? remove.variables : null,
    mutationError: update.error ?? remove.error ? errorMessage(update.error ?? remove.error) : null,
  }
}

export function useScenarioDetailPage() {
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const detail = useScenarioDetail(scenarioId)
  return {
    ...detail,
    errorText: detail.error ? errorMessage(detail.error) : null,
    delta: detail.data ? deltaBadge(detail.data.result.deltaVsBaseline) : null,
    openInSimulator: () => {
      if (detail.data) navigate('/simulador', { state: { params: detail.data.scenario.params } })
    },
  }
}
