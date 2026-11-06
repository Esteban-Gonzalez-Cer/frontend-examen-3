import type { CourseLegend, DayKey, ScheduleBlock, SchedulePeriod, WeekDay, WeekGrid } from './types'

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'lunes', label: 'Lunes', short: 'Lun' },
  { key: 'martes', label: 'Martes', short: 'Mar' },
  { key: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { key: 'jueves', label: 'Jueves', short: 'Jue' },
  { key: 'viernes', label: 'Viernes', short: 'Vie' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
]

export const PALETTE_SIZE = 6

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** JS getDay(): 0 = domingo. */
export function dayKeyFor(date: Date): DayKey | null {
  const index = date.getDay()
  return index === 0 ? null : DAYS[index - 1].key
}

function weekDays(now: Date, includeSaturday: boolean): WeekDay[] {
  const monday = new Date(now)
  const offset = (now.getDay() + 6) % 7 // days since Monday
  monday.setDate(now.getDate() - offset)
  const today = dayKeyFor(now)
  return DAYS.filter((d) => includeSaturday || d.key !== 'sabado').map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return { ...day, date: date.getDate(), isToday: day.key === today }
  })
}

export function buildWeekGrid(period: SchedulePeriod | null, now: Date = new Date()): WeekGrid {
  const courses = period?.courses ?? []
  const sessions = courses.flatMap((course, courseIndex) =>
    course.sessions.map((session) => ({ course, courseIndex, session })),
  )
  const hasSaturday = sessions.some((s) => s.session.day === 'sabado')

  const starts = sessions.map((s) => toMinutes(s.session.start))
  const ends = sessions.map((s) => toMinutes(s.session.end))
  const startHour = starts.length ? Math.floor(Math.min(...starts) / 60) : 7
  const endHour = ends.length ? Math.ceil(Math.max(...ends) / 60) : 15
  const span = Math.max(60, (endHour - startHour) * 60)

  const today = dayKeyFor(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const blocks: ScheduleBlock[] = sessions.map(({ course, courseIndex, session }) => {
    const start = toMinutes(session.start)
    const end = toMinutes(session.end)
    return {
      id: `${course.groupId}-${session.day}-${session.start}`,
      day: session.day,
      start: session.start,
      end: session.end,
      topPct: ((start - startHour * 60) / span) * 100,
      heightPct: ((end - start) / span) * 100,
      clave: course.clave,
      name: course.name,
      groupLetter: course.groupLetter,
      room: session.room,
      colorIndex: courseIndex % PALETTE_SIZE,
      isNow: session.day === today && nowMinutes >= start && nowMinutes < end,
    }
  })

  const legend: CourseLegend[] = courses.map((course, index) => ({
    clave: course.clave,
    name: course.name,
    groupLetter: course.groupLetter,
    planName: course.planName,
    weeklyHours: course.sessions.reduce((sum, s) => sum + (toMinutes(s.end) - toMinutes(s.start)) / 60, 0),
    colorIndex: index % PALETTE_SIZE,
  }))

  return {
    days: weekDays(now, hasSaturday),
    hours: Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
    startHour,
    endHour,
    blocks,
    legend,
  }
}

export function blocksForDay(grid: WeekGrid, day: DayKey): ScheduleBlock[] {
  return grid.blocks.filter((b) => b.day === day).sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
}

export function defaultDay(grid: WeekGrid): DayKey {
  return grid.days.find((d) => d.isToday)?.key ?? grid.days[0]?.key ?? 'lunes'
}

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}
