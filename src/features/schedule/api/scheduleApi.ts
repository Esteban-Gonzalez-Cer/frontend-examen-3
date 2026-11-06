import { http } from '@/shared/api/httpClient'
import type { ScheduleResponse } from '../model/types'

export async function fetchSchedule(): Promise<ScheduleResponse> {
  const { data } = await http.get<ScheduleResponse>('/students/me/schedule')
  return data
}
