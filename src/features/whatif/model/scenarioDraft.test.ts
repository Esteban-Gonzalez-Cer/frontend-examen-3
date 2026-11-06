import { describe, expect, it } from 'vitest'

import { deltaBadge, futureTerms } from './presentation'
import {
  countChanges,
  DEFAULT_PARAMS,
  draftActions,
  draftReducer,
  effectiveOutcome,
  isDefaultParams,
  paramsKey,
} from './scenarioDraft'

describe('draftReducer', () => {
  it('a hypothetical grade replaces an explicit outcome', () => {
    let state = draftReducer(DEFAULT_PARAMS, draftActions.outcome('IDD-2503', 'fail'))
    expect(state.outcomes).toEqual({ 'IDD-2503': 'fail' })
    state = draftReducer(state, draftActions.grade('IDD-2503', '82'))
    expect(state.outcomes).toEqual({})
    expect(state.grades).toEqual({ 'IDD-2503': 82 })
    expect(effectiveOutcome(state, 'IDD-2503')).toBe('pass')
  })

  it('grades below 70 mean failing; empty input clears it', () => {
    let state = draftReducer(DEFAULT_PARAMS, draftActions.grade('ACA-0909', '60'))
    expect(effectiveOutcome(state, 'ACA-0909')).toBe('fail')
    state = draftReducer(state, draftActions.grade('ACA-0909', ''))
    expect(state.grades).toEqual({})
    expect(isDefaultParams(state)).toBe(true)
  })

  it('choosing "pass" removes the override', () => {
    const failed = draftReducer(DEFAULT_PARAMS, draftActions.outcome('X', 'fail'))
    expect(draftReducer(failed, draftActions.outcome('X', 'pass')).outcomes).toEqual({})
  })

  it('the rule default for max credits is stored as null', () => {
    expect(draftReducer(DEFAULT_PARAMS, draftActions.maxCredits(36, 36)).maxCreditsPerTerm).toBeNull()
    expect(draftReducer(DEFAULT_PARAMS, draftActions.maxCredits(24, 36)).maxCreditsPerTerm).toBe(24)
  })

  it('counts changes and builds stable keys', () => {
    const a = draftReducer(draftReducer(DEFAULT_PARAMS, draftActions.postpone('B', '27/2')), draftActions.postpone('A', '28/1'))
    const b = draftReducer(draftReducer(DEFAULT_PARAMS, draftActions.postpone('A', '28/1')), draftActions.postpone('B', '27/2'))
    expect(countChanges(a)).toBe(2)
    expect(paramsKey(a)).toBe(paramsKey(b))
  })
})

describe('presentation helpers', () => {
  it('lists future terms with or without summer', () => {
    expect(futureTerms('26/2', 3, false).map((t) => t.code)).toEqual(['27/1', '27/2', '28/1'])
    expect(futureTerms('26/2', 3, true).map((t) => t.code)).toEqual(['27/1', '27/V', '27/2'])
    expect(futureTerms('26/2', 1, false)[0].label).toBe('Ene–Jun 2027')
  })

  it('describes graduation deltas', () => {
    expect(deltaBadge(0).tone).toBe('none')
    expect(deltaBadge(1)).toEqual({ text: '+1 semestre de retraso', tone: 'risk' })
    expect(deltaBadge(-1)).toEqual({ text: '1 semestre antes', tone: 'good' })
    expect(deltaBadge(null).tone).toBe('risk')
  })
})
