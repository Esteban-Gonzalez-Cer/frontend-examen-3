import { firstName, formatNumber, formatPct } from '@/shared/lib/format'
import type { DashboardSegment, FactGroup, StudentProfile } from './types'

export function greetingName(profile: StudentProfile): string {
  return firstName(profile.fullName)
}

/** The segmented pill bar under the greeting (black / yellow / stripes / outline). */
export function progressSegments(profile: StudentProfile): DashboardSegment[] {
  const approved = Math.max(0, Math.min(100, profile.progressPct))
  const pending = Math.max(0, 100 - approved)
  return [
    { key: 'approved', label: 'Créditos aprobados', value: approved, display: formatPct(approved), tone: 'ink' },
    {
      key: 'current',
      label: 'Cursando',
      value: 16,
      display: formatPct(profile.progressInProgressPct),
      tone: 'accent',
    },
    { key: 'pending', label: 'Por acreditar', value: pending, display: formatPct(pending), tone: 'stripes' },
    { key: 'average', label: 'Promedio', value: 12, display: formatNumber(profile.arithmeticAverage), tone: 'outline' },
  ]
}

export function academicFacts(profile: StudentProfile): FactGroup[] {
  return [
    {
      id: 'identity',
      title: 'Datos del estudiante',
      facts: [
        { label: 'Número de control', value: profile.numeroControl },
        { label: 'Correo', value: profile.email },
        { label: 'Semestre', value: String(profile.semester) },
      ],
    },
    {
      id: 'subjects',
      title: 'Materias',
      facts: [
        { label: 'Cursadas', value: String(profile.subjectsTaken) },
        { label: 'Aprobadas', value: String(profile.subjectsApproved) },
        { label: 'Reprobadas', value: String(profile.subjectsFailed) },
        { label: 'Reprobadas sin acreditar', value: String(profile.subjectsFailedNotAccredited) },
      ],
    },
    {
      id: 'averages',
      title: 'Promedios y créditos',
      facts: [
        { label: 'Promedio ponderado', value: formatNumber(profile.weightedAverage) },
        { label: 'Promedio aritmético', value: formatNumber(profile.arithmeticAverage) },
        { label: 'Créditos acumulados', value: String(profile.creditsAccumulated) },
        { label: 'Créditos complementarios', value: String(profile.complementaryCredits) },
      ],
    },
  ]
}
