import { describe, expect, it } from 'vitest'

import { filterGrades, gradeLevel, summarizePeriod } from './grades'
import type { GradesPeriod } from './types'

const period: GradesPeriod = {
  termCode: '26/2',
  termLabel: 'Ago–Dic 2026',
  year: 2026,
  description: 'Agosto - Diciembre 2026',
  average: 87.4,
  courses: [
    {
      groupId: 1,
      clave: 'IDD-2502',
      name: 'CIBERSEGURIDAD',
      groupLetter: 'A',
      partials: [
        { number: 1, grade: 91 },
        { number: 2, grade: 94 },
        { number: 3, grade: null },
        { number: 4, grade: null },
      ],
      gradedCount: 2,
      average: 92.5,
      final: null,
      level: 'good',
    },
    {
      groupId: 2,
      clave: 'IDD-2503',
      name: 'DESARROLLOS MÓVILES Y TECNOLOGÍAS EN LA NUBE',
      groupLetter: 'A',
      partials: [
        { number: 1, grade: 75 },
        { number: 2, grade: 75 },
      ],
      gradedCount: 2,
      average: 75,
      final: 75,
      level: 'warning',
    },
  ],
}

describe('gradeLevel', () => {
  it('uses the green / yellow / red thresholds', () => {
    expect(gradeLevel(85)).toBe('good')
    expect(gradeLevel(84.9)).toBe('warning')
    expect(gradeLevel(70)).toBe('warning')
    expect(gradeLevel(69)).toBe('risk')
    expect(gradeLevel(null)).toBe('none')
  })
})

describe('filterGrades', () => {
  it('matches subject names ignoring accents and case', () => {
    const result = filterGrades([period], 'moviles', 'all')
    expect(result[0].courses.map((c) => c.clave)).toEqual(['IDD-2503'])
  })

  it('matches by period', () => {
    expect(filterGrades([period], '26/2', 'all')[0].courses).toHaveLength(2)
    expect(filterGrades([period], 'agosto', 'all')[0].courses).toHaveLength(2)
  })

  it('filters by traffic-light level and drops empty periods', () => {
    expect(filterGrades([period], '', 'warning')[0].courses.map((c) => c.clave)).toEqual(['IDD-2503'])
    expect(filterGrades([period], '', 'risk')).toEqual([])
  })
})

describe('summarizePeriod', () => {
  it('counts levels and captured partials', () => {
    const summary = summarizePeriod(period)
    expect(summary.counts).toEqual({ good: 1, warning: 1, risk: 0, none: 0 })
    expect(summary.gradedPartials).toBe(4)
    expect(summary.totalPartials).toBe(6)
    expect(summary.capturedPct).toBe(67)
  })
})
