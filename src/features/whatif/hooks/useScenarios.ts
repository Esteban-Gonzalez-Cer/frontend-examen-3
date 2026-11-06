import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { createScenario, deleteScenario, fetchScenario, fetchScenarios, updateScenario } from '../api/whatifApi'

export const scenariosQueryKey = ['whatif', 'scenarios'] as const

export function useScenarios() {
  const queryClient = useQueryClient()
  const list = useQuery({ queryKey: scenariosQueryKey, queryFn: fetchScenarios })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: scenariosQueryKey })

  const create = useMutation({ mutationFn: createScenario, onSuccess: invalidate })
  const update = useMutation({ mutationFn: updateScenario, onSuccess: invalidate })
  const remove = useMutation({ mutationFn: deleteScenario, onSuccess: invalidate })

  return { list, create, update, remove }
}

export function useScenarioDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...scenariosQueryKey, id],
    queryFn: () => fetchScenario(id as string),
    enabled: Boolean(id),
  })
}

/** Inline rename state for the scenarios list. */
export function useRenameState() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [value, setValue] = useState('')
  return {
    editingId,
    value,
    setValue,
    start: (id: string, current: string) => {
      setEditingId(id)
      setValue(current)
    },
    stop: () => setEditingId(null),
  }
}
