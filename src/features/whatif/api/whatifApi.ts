import { http } from '@/shared/api/httpClient'
import type { Scenario, ScenarioDetail, ScenarioParams, SimulationResult } from '../model/types'

export async function fetchAnalysis(): Promise<SimulationResult> {
  const { data } = await http.get<SimulationResult>('/whatif/analysis')
  return data
}

export async function runSimulation(params: ScenarioParams): Promise<SimulationResult> {
  const { data } = await http.post<SimulationResult>('/whatif/simulate', params)
  return data
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const { data } = await http.get<Scenario[]>('/whatif/scenarios')
  return data
}

export async function createScenario(input: { name: string; params: ScenarioParams }): Promise<Scenario> {
  const { data } = await http.post<Scenario>('/whatif/scenarios', input)
  return data
}

export async function fetchScenario(id: string): Promise<ScenarioDetail> {
  const { data } = await http.get<ScenarioDetail>(`/whatif/scenarios/${encodeURIComponent(id)}`)
  return data
}

export async function updateScenario(input: {
  id: string
  name?: string
  params?: ScenarioParams
}): Promise<Scenario> {
  const { id, ...body } = input
  const { data } = await http.put<Scenario>(`/whatif/scenarios/${encodeURIComponent(id)}`, body)
  return data
}

export async function deleteScenario(id: string): Promise<void> {
  await http.delete(`/whatif/scenarios/${encodeURIComponent(id)}`)
}
