import { normalizeText } from '@/shared/lib/format'
import type { CourseGrades, GradeLevel, GradesPeriod, LevelFilter } from './types'

export const PASSING_GRADE = 70

/** Same thresholds as the backend: green ≥ 85, yellow 70–84, red < 70. */
export function gradeLevel(value: number | null | undefined): GradeLevel {
  if (value === null || value === undefined) return 'none'
  if (value >= 85) return 'good'
  if (value >= PASSING_GRADE) return 'warning'
  return 'risk'
}

export const LEVEL_LABEL: Record<GradeLevel, string> = {
  good: 'Excelente',
  warning: 'Regular',
  risk: 'En riesgo',
  none: 'Sin calificar',
}

function courseMatches(course: CourseGrades, period: GradesPeriod, query: string): boolean {
  if (!query) return true
  const haystack = normalizeText(
    [course.name, course.clave, course.groupLetter, period.termCode, period.termLabel, period.description].join(' '),
  )
  return haystack.includes(query)
}

/** Real-time filter by subject name/clave or period, plus traffic-light level. */
export function filterGrades(periods: GradesPeriod[], rawQuery: string, level: LevelFilter): GradesPeriod[] {
  const query = normalizeText(rawQuery)
  return periods
    .map((period) => ({
      ...period,
      courses: period.courses.filter(
        (course) => courseMatches(course, period, query) && (level === 'all' || course.level === level),
      ),
    }))
    .filter((period) => period.courses.length > 0)
}

export interface PeriodSummary {
  average: number | null
  counts: Record<GradeLevel, number>
  gradedPartials: number
  totalPartials: number
  capturedPct: number
}

export function isPassing(course: CourseGrades): boolean {
  return course.average !== null && course.average >= PASSING_GRADE
}

export function summarizePeriod(period: GradesPeriod): PeriodSummary {
  const counts: Record<GradeLevel, number> = { good: 0, warning: 0, risk: 0, none: 0 }
  let graded = 0
  let total = 0
  for (const course of period.courses) {
    counts[course.level] += 1
    graded += course.gradedCount
    total += course.partials.length
  }
  return {
    average: period.average,
    counts,
    gradedPartials: graded,
    totalPartials: total,
    capturedPct: total ? Math.round((graded / total) * 100) : 0,
  }
}

export function currentPeriod(periods: GradesPeriod[]): GradesPeriod | null {
  return periods[0] ?? null
}

export interface SemaphoreItem {
  level: GradeLevel
  label: string
  range: string
  count: number
  /** Share of the period's courses, 0–100. */
  share: number
}

const SEMAPHORE_RANGES: Record<GradeLevel, string> = {
  good: '≥ 85',
  warning: '70–84',
  risk: '< 70',
  none: 'Sin parciales',
}

/** Traffic-light breakdown of a period; "sin calificar" only appears when present. */
export function semaphoreItems(counts: Record<GradeLevel, number>): SemaphoreItem[] {
  const total = counts.good + counts.warning + counts.risk + counts.none
  const levels: GradeLevel[] = counts.none ? ['good', 'warning', 'risk', 'none'] : ['good', 'warning', 'risk']
  return levels.map((level) => ({
    level,
    label: LEVEL_LABEL[level],
    range: SEMAPHORE_RANGES[level],
    count: counts[level],
    share: total ? (counts[level] / total) * 100 : 0,
  }))
}
