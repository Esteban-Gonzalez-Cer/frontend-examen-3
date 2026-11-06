import { normalizeText } from '@/shared/lib/format'
import type { KardexEntry, KardexSemester, SemesterBar } from './types'

function entryMatches(entry: KardexEntry, query: string): boolean {
  if (!query) return true
  return normalizeText(
    [entry.name, entry.clave, entry.termCode, entry.termLabel, entry.description, `semestre ${entry.semester}`].join(' '),
  ).includes(query)
}

export function filterKardex(semesters: KardexSemester[], rawQuery: string): KardexSemester[] {
  const query = normalizeText(rawQuery)
  if (!query) return semesters
  return semesters
    .map((semester) => ({ ...semester, entries: semester.entries.filter((e) => entryMatches(e, query)) }))
    .filter((semester) => semester.entries.length > 0)
}

/** One bar per semester; the best average is highlighted in yellow. */
export function semesterBars(semesters: KardexSemester[]): SemesterBar[] {
  const best = semesters.reduce<KardexSemester | null>(
    (acc, s) => (s.average !== null && (acc === null || (acc.average ?? 0) < s.average) ? s : acc),
    null,
  )
  return semesters.map((semester) => ({
    key: String(semester.semester),
    label: `S${semester.semester}`,
    value: semester.average,
    highlight: best?.semester === semester.semester,
    tooltip: semester.average === null ? `Semestre ${semester.semester}` : `${semester.average.toFixed(1)}`,
  }))
}

export function gradeDisplay(entry: KardexEntry): string {
  if (entry.grade !== null) return String(entry.grade)
  return entry.gradeLabel ?? '—'
}

export function descriptionLabel(description: string): string {
  return description
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' · ')
}
