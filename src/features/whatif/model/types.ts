export type Outcome = 'pass' | 'fail'
export type ServicioSocialStatus = 'not_started' | 'in_progress' | 'done'

export interface ScenarioParams {
  maxCreditsPerTerm: number | null
  includeSummer: boolean
  outcomes: Record<string, Outcome>
  grades: Record<string, number>
  postpone: Record<string, string>
  servicioSocial: ServicioSocialStatus
}

export type NodeStatus = 'approved' | 'in_progress' | 'failed_sim' | 'available' | 'planned' | 'unreachable'

export interface PlannedSubject {
  clave: string
  name: string
  credits: number
  isRetake: boolean
  countsTowardLoad: boolean
}

export interface PlannedTerm {
  term: string
  label: string
  isSummer: boolean
  loadCredits: number
  creditsAfter: number
  subjects: PlannedSubject[]
}

export type CriticalReason =
  | 'start'
  | 'retake'
  | 'prereq'
  | 'coreq'
  | 'credit_gate'
  | 'postponed'
  | 'load_limit'
  | 'summer_rules'

export interface CriticalStep {
  clave: string
  name: string
  term: string
  termLabel: string
  reason: CriticalReason
  detail: string
}

export type BottleneckKind = 'hidden' | 'structural' | 'gate'

export interface Bottleneck {
  clave: string
  name: string
  kind: BottleneckKind
  score: number
  descendants: number
  downstreamCredits: number
  slack: number | null
  delayTerms: number | null
  detail: string
}

export interface FailureImpact {
  clave: string
  name: string
  scenario: 'fail' | 'postpone'
  delayTerms: number | null
  newGraduationTerm: string | null
  newGraduationLabel: string | null
}

export interface GateMilestone {
  pct: number
  creditsNeeded: number
  subjects: string[]
  reachedNow: boolean
  projectedTerm: string | null
  projectedLabel: string | null
}

export interface CreditSummary {
  approved: number
  inProgress: number
  afterCurrentTerm: number
  total: number
  approvedPct: number
  afterCurrentPct: number
}

export interface GraphNode {
  clave: string
  name: string
  credits: number
  suggestedSemester: number
  gridRow: number
  gridCol: number
  kind: 'generic' | 'specialty' | 'special_requirement'
  status: NodeStatus
  gradeLabel: string | null
  plannedTerm: string | null
  plannedLabel: string | null
  minCreditPct: number | null
  onCriticalPath: boolean
  slack: number | null
}

export interface GraphEdge {
  source: string
  target: string
  type: 'prereq' | 'coreq'
  critical: boolean
}

export interface CurriculumRules {
  maxCreditsPerTerm: number
  minCreditsPerTerm: number
  summerMaxSubjects: number
  passingGrade: number
}

export interface SimulationResult {
  currentTerm: string
  currentTermLabel: string
  projectedGraduationTerm: string | null
  projectedGraduationLabel: string | null
  termsRemaining: number | null
  deltaVsBaseline: number | null
  credits: CreditSummary
  plan: PlannedTerm[]
  criticalPath: CriticalStep[]
  bottlenecks: Bottleneck[]
  failureImpact: FailureImpact[]
  gates: GateMilestone[]
  gpa: { current: number | null; projected: number | null }
  nodes: GraphNode[]
  edges: GraphEdge[]
  warnings: string[]
  unreachable: string[]
  rules: CurriculumRules | null
}

export interface ScenarioSummary {
  projectedGraduationTerm: string | null
  projectedGraduationLabel: string | null
  termsRemaining: number | null
  deltaVsBaseline: number | null
  projectedGpa: number | null
  computedAt: string | null
}

export interface Scenario {
  id: string
  name: string
  params: ScenarioParams
  summary: ScenarioSummary
  createdAt: string
  updatedAt: string
}

export interface ScenarioDetail {
  scenario: Scenario
  result: SimulationResult
}
