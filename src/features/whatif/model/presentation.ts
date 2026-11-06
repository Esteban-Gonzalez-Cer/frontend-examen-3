import type {
  BottleneckKind,
  CriticalReason,
  FailureImpact,
  GateMilestone,
  GraphNode,
  NodeStatus,
  ScenarioParams,
  ServicioSocialStatus,
  SimulationResult,
} from './types'

export const STATUS_LABEL: Record<NodeStatus, string> = {
  approved: 'Aprobada',
  in_progress: 'Cursando',
  failed_sim: 'Reprobada (simulado)',
  available: 'Disponible',
  planned: 'Planeada',
  unreachable: 'Bloqueada',
}

export const STATUS_TONE: Record<NodeStatus, 'ink' | 'accent' | 'risk' | 'outline'> = {
  approved: 'ink',
  in_progress: 'accent',
  failed_sim: 'risk',
  available: 'outline',
  planned: 'outline',
  unreachable: 'outline',
}

export const REASON_LABEL: Record<CriticalReason, string> = {
  start: 'Disponible',
  retake: 'Recursamiento',
  prereq: 'Prerrequisito',
  coreq: 'Co-requisito',
  credit_gate: 'Umbral de créditos',
  postponed: 'Pospuesta',
  load_limit: 'Límite de carga',
  summer_rules: 'Reglas de verano',
}

export const BOTTLENECK_LABEL: Record<BottleneckKind, string> = {
  hidden: 'Oculto',
  gate: 'Umbral',
  structural: 'Estructural',
}

export const SERVICIO_SOCIAL_OPTIONS: { value: ServicioSocialStatus; label: string }[] = [
  { value: 'not_started', label: 'No iniciado' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'done', label: 'Liberado' },
]

export const SERVICIO_SOCIAL = 'SS-0001'

export interface DeltaBadge {
  text: string
  tone: 'good' | 'risk' | 'none'
}

export function deltaBadge(delta: number | null): DeltaBadge {
  if (delta === null) return { text: 'Sin fecha de egreso', tone: 'risk' }
  if (delta === 0) return { text: 'Igual que tu ruta actual', tone: 'none' }
  const abs = Math.abs(delta)
  const unit = abs === 1 ? 'semestre' : 'semestres'
  return delta > 0 ? { text: `+${abs} ${unit} de retraso`, tone: 'risk' } : { text: `${abs} ${unit} antes`, tone: 'good' }
}

/** Future term codes after `current` ("26/2" → ["27/1", "27/V"?, "27/2", …]). */
export function futureTerms(current: string, count: number, includeSummer: boolean): { code: string; label: string }[] {
  const match = /^(\d{2})\/(1|2|V)$/i.exec(current)
  if (!match) return []
  let year = Number(match[1])
  let kind = match[2].toUpperCase()
  const labels: Record<string, string> = { '1': 'Ene–Jun', V: 'Verano', '2': 'Ago–Dic' }
  const out: { code: string; label: string }[] = []
  while (out.length < count) {
    if (kind === '1') kind = includeSummer ? 'V' : '2'
    else if (kind === 'V') kind = '2'
    else {
      kind = '1'
      year += 1
    }
    const code = `${String(year).padStart(2, '0')}/${kind}`
    out.push({ code, label: `${labels[kind]} 20${String(year).padStart(2, '0')}` })
  }
  return out
}

export interface NodeDetail {
  node: GraphNode
  prerequisites: { clave: string; name: string; type: 'prereq' | 'coreq'; status: NodeStatus }[]
  dependents: { clave: string; name: string; type: 'prereq' | 'coreq' }[]
  canSimulateOutcome: boolean
  canPostpone: boolean
  postponedTo: string | null
}

export function nodeDetail(result: SimulationResult, clave: string, params: ScenarioParams): NodeDetail | null {
  const byClave = new Map(result.nodes.map((n) => [n.clave, n]))
  const node = byClave.get(clave)
  if (!node) return null
  const prerequisites = result.edges
    .filter((e) => e.target === clave)
    .map((e) => {
      const source = byClave.get(e.source)
      return { clave: e.source, name: source?.name ?? e.source, type: e.type, status: source?.status ?? 'unreachable' }
    })
  const dependents = result.edges
    .filter((e) => e.source === clave)
    .map((e) => ({ clave: e.target, name: byClave.get(e.target)?.name ?? e.target, type: e.type }))
  return {
    node,
    prerequisites,
    dependents,
    canSimulateOutcome: node.status === 'in_progress' || node.status === 'failed_sim',
    canPostpone: node.status === 'available' || node.status === 'planned' || clave in params.postpone,
    postponedTo: params.postpone[clave] ?? null,
  }
}

export function inProgressSubjects(result: SimulationResult): GraphNode[] {
  return result.nodes
    .filter((n) => n.status === 'in_progress' || n.status === 'failed_sim')
    .filter((n) => n.clave !== SERVICIO_SOCIAL)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Percent position of each credit gate on a 0–100 track. */
export function gateMarkers(result: SimulationResult) {
  return result.gates.map((gate) => ({
    ...gate,
    leftPct: gate.pct,
    reachedAfterCurrent: result.credits.afterCurrentPct >= gate.pct,
  }))
}

export function impactBadge(impact: FailureImpact): DeltaBadge {
  if (impact.delayTerms === null) return { text: 'Sin fecha de egreso', tone: 'risk' }
  if (impact.delayTerms > 0) {
    return { text: `+${impact.delayTerms} semestre(s) → ${impact.newGraduationLabel ?? ''}`.trim(), tone: 'risk' }
  }
  return { text: 'Sin retraso', tone: 'good' }
}

export function gateStatusText(gate: GateMilestone): string {
  if (gate.reachedNow) return 'Ya cumplido'
  if (gate.projectedLabel) return `Se alcanza en ${gate.projectedLabel}`
  return 'No se alcanza'
}

export const FALLBACK_MAX_CREDITS = 36

export function ruleMaxCredits(result: SimulationResult | null): number {
  return result?.rules?.maxCreditsPerTerm ?? FALLBACK_MAX_CREDITS
}
