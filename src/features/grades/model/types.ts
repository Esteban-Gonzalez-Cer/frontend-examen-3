export type GradeLevel = 'good' | 'warning' | 'risk' | 'none'

export interface PartialGrade {
  number: number
  grade: number | null
}

export interface CourseGrades {
  groupId: number
  clave: string
  name: string
  groupLetter: string
  partials: PartialGrade[]
  gradedCount: number
  average: number | null
  final: number | null
  level: GradeLevel
}

export interface GradesPeriod {
  termCode: string
  termLabel: string
  year: number
  description: string
  average: number | null
  courses: CourseGrades[]
}

export interface GradesResponse {
  periods: GradesPeriod[]
}

export type LevelFilter = 'all' | 'good' | 'warning' | 'risk'
