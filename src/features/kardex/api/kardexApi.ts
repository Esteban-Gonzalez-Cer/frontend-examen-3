import { http } from '@/shared/api/httpClient'
import type { KardexResponse } from '../model/types'

export async function fetchKardex(): Promise<KardexResponse> {
  const { data } = await http.get<KardexResponse>('/students/me/kardex')
  return data
}
