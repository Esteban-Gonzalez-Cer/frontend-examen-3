import { http } from '@/shared/api/httpClient'
import type { StudentProfile } from '../model/types'

export async function fetchProfile(): Promise<StudentProfile> {
  const { data } = await http.get<StudentProfile>('/students/me')
  return data
}
