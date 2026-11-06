import type { Outcome, ScenarioParams, ServicioSocialStatus } from './types'

export const DEFAULT_PARAMS: ScenarioParams = {
  maxCreditsPerTerm: null,
  includeSummer: false,
  outcomes: {},
  grades: {},
  postpone: {},
  servicioSocial: 'not_started',
}

export type DraftAction =
  | { type: 'setMaxCredits'; value: number | null }
  | { type: 'setSummer'; value: boolean }
  | { type: 'setOutcome'; clave: string; outcome: Outcome | null }
  | { type: 'setGrade'; clave: string; grade: number | null }
  | { type: 'setPostpone'; clave: string; term: string | null }
  | { type: 'setServicioSocial'; value: ServicioSocialStatus }
  | { type: 'reset'; params?: ScenarioParams }

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}

export function draftReducer(state: ScenarioParams, action: DraftAction): ScenarioParams {
  switch (action.type) {
    case 'setMaxCredits':
      return { ...state, maxCreditsPerTerm: action.value }
    case 'setSummer':
      return { ...state, includeSummer: action.value }
    case 'setOutcome': {
      // An explicit pass/fail wins over a hypothetical grade, so drop the grade.
      const grades = without(state.grades, action.clave)
      if (action.outcome === null) return { ...state, outcomes: without(state.outcomes, action.clave), grades }
      return { ...state, outcomes: { ...state.outcomes, [action.clave]: action.outcome }, grades }
    }
    case 'setGrade': {
      // The grade decides the outcome (≥ 70 pass), so drop any explicit outcome.
      const outcomes = without(state.outcomes, action.clave)
      if (action.grade === null || Number.isNaN(action.grade)) {
        return { ...state, grades: without(state.grades, action.clave), outcomes }
      }
      const grade = Math.max(0, Math.min(100, action.grade))
      return { ...state, grades: { ...state.grades, [action.clave]: grade }, outcomes }
    }
    case 'setPostpone':
      return {
        ...state,
        postpone:
          action.term === null
            ? without(state.postpone, action.clave)
            : { ...state.postpone, [action.clave]: action.term },
      }
    case 'setServicioSocial':
      return { ...state, servicioSocial: action.value }
    case 'reset':
      return action.params ? normalizeParams(action.params) : DEFAULT_PARAMS
  }
}

export function normalizeParams(params: Partial<ScenarioParams> | null | undefined): ScenarioParams {
  return {
    maxCreditsPerTerm: params?.maxCreditsPerTerm ?? null,
    includeSummer: params?.includeSummer ?? false,
    outcomes: { ...(params?.outcomes ?? {}) },
    grades: { ...(params?.grades ?? {}) },
    postpone: { ...(params?.postpone ?? {}) },
    servicioSocial: params?.servicioSocial ?? 'not_started',
  }
}

export function countChanges(params: ScenarioParams): number {
  return (
    (params.maxCreditsPerTerm !== null ? 1 : 0) +
    (params.includeSummer ? 1 : 0) +
    (params.servicioSocial !== 'not_started' ? 1 : 0) +
    Object.keys(params.outcomes).length +
    Object.keys(params.grades).length +
    Object.keys(params.postpone).length
  )
}

export function isDefaultParams(params: ScenarioParams): boolean {
  return countChanges(params) === 0
}

/** Stable serialisation, used as the query key of a simulation. */
export function paramsKey(params: ScenarioParams): string {
  const sortRecord = <T>(record: Record<string, T>) =>
    Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify({
    ...params,
    outcomes: sortRecord(params.outcomes),
    grades: sortRecord(params.grades),
    postpone: sortRecord(params.postpone),
  })
}

/** Effective outcome of an in-progress subject under the draft (default: pass). */
export function effectiveOutcome(params: ScenarioParams, clave: string, passingGrade = 70): Outcome {
  const explicit = params.outcomes[clave]
  if (explicit) return explicit
  const grade = params.grades[clave]
  if (grade !== undefined) return grade >= passingGrade ? 'pass' : 'fail'
  return 'pass'
}

/** Action creators: translate raw control values into draft actions. */
export const draftActions = {
  maxCredits(value: number, ruleDefault: number): DraftAction {
    return { type: 'setMaxCredits', value: value === ruleDefault ? null : value }
  },
  outcome(clave: string, outcome: Outcome): DraftAction {
    // "pass" is the default assumption, so it clears the override.
    return { type: 'setOutcome', clave, outcome: outcome === 'pass' ? null : outcome }
  },
  grade(clave: string, raw: string): DraftAction {
    const trimmed = raw.trim()
    return { type: 'setGrade', clave, grade: trimmed === '' ? null : Number(trimmed) }
  },
  postpone(clave: string, term: string): DraftAction {
    return { type: 'setPostpone', clave, term: term || null }
  },
}
