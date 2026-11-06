import { http } from '@/shared/api/httpClient'
import type { GradesResponse } from '../model/types'

export async function fetchGrades(): Promise<GradesResponse> {
  const { data } = await http.get<GradesResponse>('/students/me/grades')
  return data
}
