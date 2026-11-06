export interface StudentProfile {
  numeroControl: string
  fullName: string
  email: string
  semester: number
  creditsAccumulated: number
  weightedAverage: number
  arithmeticAverage: number
  subjectsTaken: number
  subjectsApproved: number
  subjectsFailed: number
  subjectsFailedNotAccredited: number
  complementaryCredits: number
  progressPct: number
  progressInProgressPct: number | null
  photoDataUrl: string | null
}

export interface DashboardSegment {
  key: string
  label: string
  value: number
  display: string
  tone: 'ink' | 'accent' | 'stripes' | 'outline'
}

export interface FactGroup {
  id: string
  title: string
  facts: { label: string; value: string }[]
}
