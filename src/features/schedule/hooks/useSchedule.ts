import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { errorMessage } from '@/shared/api/errors'
import { useNow } from '@/shared/lib/hooks'
import { fetchSchedule } from '../api/scheduleApi'
import { blocksForDay, buildWeekGrid, defaultDay } from '../model/schedule'
import type { DayKey } from '../model/types'

export const scheduleQueryKey = ['student', 'schedule'] as const

export function useSchedule() {
  return useQuery({ queryKey: scheduleQueryKey, queryFn: fetchSchedule })
}

export function useWeekSchedule() {
  const query = useSchedule()
  const now = useNow(60_000)
  const period = query.data?.periods[0] ?? null
  const grid = useMemo(() => buildWeekGrid(period, new Date(now)), [period, now])
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null)
  const day = selectedDay ?? defaultDay(grid)

  return {
    ...query,
    errorText: query.error ? errorMessage(query.error) : null,
    period,
    grid,
    day,
    setDay: setSelectedDay,
    dayBlocks: blocksForDay(grid, day),
  }
}
