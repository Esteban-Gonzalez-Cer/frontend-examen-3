export type KardexLevel = 'good' | 'warning' | 'risk' | 'none'

export interface KardexEntry {
  clave: string
  name: string
  termCode: string
  termLabel: string
  credits: number
  grade: number | null
  gradeLabel: string | null
  accredited: boolean
  level: KardexLevel
  description: string
  semester: number
}

export interface KardexSemester {
  semester: number
  credits: number
  average: number | null
  entries: KardexEntry[]
}

export interface KardexResponse {
  progressPct: number
  accreditedCredits: number
  average: number | null
  approvedCount: number
  failedCount: number
  semesters: KardexSemester[]
}

export interface SemesterBar {
  key: string
  label: string
  value: number | null
  highlight: boolean
  tooltip: string
}
