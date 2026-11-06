import { useMemo, useState } from 'react'
import { useLocation } from 'react-router'

import { errorMessage } from '@/shared/api/errors'
import { countChanges, effectiveOutcome } from '../model/scenarioDraft'
import { futureTerms, inProgressSubjects, nodeDetail, ruleMaxCredits } from '../model/presentation'
import type { ScenarioParams } from '../model/types'
import { useScenarios } from './useScenarios'
import { useScenarioDraft, useSimulation } from './useSimulation'

/** Everything the simulator view needs: draft, live result, node selection and saving. */
export function useSimulatorPage() {
  const location = useLocation()
  const initial = (location.state as { params?: ScenarioParams } | null)?.params ?? null
  const { draft, dispatch } = useScenarioDraft(initial)
  const simulation = useSimulation(draft)
  const { create } = useScenarios()

  const [selected, setSelected] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState('')

  const result = simulation.result
  const detail = useMemo(
    () => (result && selected ? nodeDetail(result, selected, draft) : null),
    [result, selected, draft],
  )
  const current = useMemo(() => (result ? inProgressSubjects(result) : []), [result])
  const termOptions = useMemo(
    () => (result ? futureTerms(result.currentTerm, 6, draft.includeSummer) : []),
    [result, draft.includeSummer],
  )

  const save = () => {
    const name = scenarioName.trim()
    if (!name) return
    create.mutate(
      { name, params: draft },
      {
        onSuccess: () => {
          setSaveOpen(false)
          setScenarioName('')
        },
      },
    )
  }

  return {
    draft,
    dispatch,
    changes: countChanges(draft),
    maxCreditsDefault: ruleMaxCredits(simulation.result),
    outcomeOf: (clave: string) => effectiveOutcome(draft, clave),
    ...simulation,
    errorText: simulation.error ? errorMessage(simulation.error) : null,
    current,
    termOptions,
    selected,
    select: (clave: string | null) => setSelected((prev) => (prev === clave ? null : clave)),
    detail,
    saveDialog: {
      open: saveOpen,
      openDialog: () => setSaveOpen(true),
      close: () => setSaveOpen(false),
      name: scenarioName,
      setName: setScenarioName,
      save,
      saving: create.isPending,
      error: create.isError ? errorMessage(create.error) : null,
      savedId: create.data?.id ?? null,
    },
  }
}
