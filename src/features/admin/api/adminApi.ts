import { http } from '@/shared/api/httpClient'
import type { SubjectPayload } from '../model/forms'
import type { AdminRequisite, AdminSubject, CurriculumRules, RequisiteFormValues } from '../model/types'

export async function fetchSubjects(): Promise<AdminSubject[]> {
  const { data } = await http.get<AdminSubject[]>('/admin/subjects')
  return data
}

export async function createSubject(payload: SubjectPayload): Promise<AdminSubject> {
  const { data } = await http.post<AdminSubject>('/admin/subjects', payload)
  return data
}

export async function updateSubject(payload: SubjectPayload): Promise<AdminSubject> {
  const { clave, ...body } = payload
  const { data } = await http.put<AdminSubject>(`/admin/subjects/${encodeURIComponent(clave)}`, body)
  return data
}

export async function deleteSubject(clave: string): Promise<void> {
  await http.delete(`/admin/subjects/${encodeURIComponent(clave)}`)
}

export async function fetchRequisites(): Promise<AdminRequisite[]> {
  const { data } = await http.get<AdminRequisite[]>('/admin/requisites')
  return data
}

export async function createRequisite(values: RequisiteFormValues): Promise<AdminRequisite> {
  const { data } = await http.post<AdminRequisite>('/admin/requisites', values)
  return data
}

export async function deleteRequisite(id: number): Promise<void> {
  await http.delete(`/admin/requisites/${id}`)
}

export async function fetchRules(): Promise<CurriculumRules> {
  const { data } = await http.get<CurriculumRules>('/admin/rules')
  return data
}

export async function saveRules(rules: CurriculumRules): Promise<CurriculumRules> {
  const { data } = await http.put<CurriculumRules>('/admin/rules', rules)
  return data
}
