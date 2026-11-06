import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { errorMessage } from '@/shared/api/errors'

import { fetchKardex } from '../api/kardexApi'
import { filterKardex, semesterBars } from '../model/kardex'

export const kardexQueryKey = ['student', 'kardex'] as const

export function useKardex() {
  return useQuery({ queryKey: kardexQueryKey, queryFn: fetchKardex })
}

export function useKardexView() {
  const query = useKardex()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  const semesters = useMemo(() => query.data?.semesters ?? [], [query.data])
  const filtered = useMemo(() => filterKardex(semesters, search), [semesters, search])
  const bars = useMemo(() => semesterBars(semesters), [semesters])

  const toggleSemester = (semester: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(semester)) next.delete(semester)
      else next.add(semester)
      return next
    })

  return {
    ...query,
    errorText: query.error ? errorMessage(query.error) : null,
    filtered,
    bars,
    search,
    setSearch,
    isCollapsed: (semester: number) => collapsed.has(semester) && !search,
    toggleSemester,
  }
}

export function useSemesterAverages() {
  const query = useKardex()
  const bars = useMemo(() => semesterBars(query.data?.semesters ?? []), [query.data])
  return { ...query, bars }
}
