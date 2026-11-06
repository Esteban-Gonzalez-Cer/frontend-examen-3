export type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado'

export interface ClassSession {
  day: DayKey
  start: string
  end: string
  room: string | null
}

export interface ScheduledCourse {
  groupId: number
  clave: string
  name: string
  groupLetter: string
  planName: string | null
  sessions: ClassSession[]
}

export interface SchedulePeriod {
  termCode: string
  termLabel: string
  year: number
  description: string
  courses: ScheduledCourse[]
}

export interface ScheduleResponse {
  periods: SchedulePeriod[]
}

export interface WeekDay {
  key: DayKey
  label: string
  short: string
  date: number | null
  isToday: boolean
}

export interface ScheduleBlock {
  id: string
  day: DayKey
  start: string
  end: string
  topPct: number
  heightPct: number
  clave: string
  name: string
  groupLetter: string
  room: string | null
  colorIndex: number
  isNow: boolean
}

export interface CourseLegend {
  clave: string
  name: string
  groupLetter: string
  planName: string | null
  weeklyHours: number
  colorIndex: number
}

export interface WeekGrid {
  days: WeekDay[]
  hours: number[]
  startHour: number
  endHour: number
  blocks: ScheduleBlock[]
  legend: CourseLegend[]
}
