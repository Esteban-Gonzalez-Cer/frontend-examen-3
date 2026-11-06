import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useReducer } from 'react'

import { useDebouncedValue } from '@/shared/lib/hooks'
import { fetchAnalysis, runSimulation } from '../api/whatifApi'
import { DEFAULT_PARAMS, draftReducer, isDefaultParams, normalizeParams, paramsKey } from '../model/scenarioDraft'
import type { ScenarioParams } from '../model/types'

export const analysisQueryKey = ['whatif', 'analysis'] as const

export function useAnalysis() {
  return useQuery({ queryKey: analysisQueryKey, queryFn: fetchAnalysis })
}

export function useScenarioDraft(initial?: Partial<ScenarioParams> | null) {
  const [draft, dispatch] = useReducer(draftReducer, initial ? normalizeParams(initial) : DEFAULT_PARAMS)
  return { draft, dispatch }
}

/**
 * Real-time simulation: the baseline comes from GET /whatif/analysis; any change in the draft
 * is debounced and sent to POST /whatif/simulate while the previous result stays on screen.
 */
export function useSimulation(draft: ScenarioParams) {
  const debounced = useDebouncedValue(draft, 350)
  const isBaseline = isDefaultParams(debounced)
  const analysis = useAnalysis()
  const simulation = useQuery({
    queryKey: ['whatif', 'simulate', paramsKey(debounced)],
    queryFn: () => runSimulation(debounced),
    enabled: !isBaseline,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

  const active = isBaseline ? analysis : simulation
  const result = active.data ?? analysis.data ?? null
  const pendingInput = paramsKey(draft) !== paramsKey(debounced)

  return {
    result,
    baseline: analysis.data ?? null,
    isInitialLoading: analysis.isPending && !result,
    isUpdating: pendingInput || (!isBaseline && simulation.isFetching),
    error: active.error ?? (result ? null : analysis.error),
    retry: () => (isBaseline ? analysis.refetch() : simulation.refetch()),
  }
}
