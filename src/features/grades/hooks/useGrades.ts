import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { errorMessage } from '@/shared/api/errors'

import { fetchGrades } from '../api/gradesApi'
import { currentPeriod, filterGrades, summarizePeriod } from '../model/grades'
import type { LevelFilter } from '../model/types'

export const gradesQueryKey = ['student', 'grades'] as const

export function useGrades() {
  return useQuery({ queryKey: gradesQueryKey, queryFn: fetchGrades })
}

export function useGradesView() {
  const query = useGrades()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<LevelFilter>('all')

  const periods = useMemo(() => query.data?.periods ?? [], [query.data])
  const filtered = useMemo(() => filterGrades(periods, search, level), [periods, search, level])
  const current = currentPeriod(periods)
  const summary = current ? summarizePeriod(current) : null

  const errorText = query.error ? errorMessage(query.error) : null
  return { ...query, errorText, periods, filtered, current, summary, search, setSearch, level, setLevel }
}

export function useCurrentTermGrades() {
  const query = useGrades()
  const current = currentPeriod(query.data?.periods ?? [])
  return { ...query, current, summary: current ? summarizePeriod(current) : null }
}
