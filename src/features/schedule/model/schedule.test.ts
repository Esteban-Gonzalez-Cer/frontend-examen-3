import { describe, expect, it } from 'vitest'

import { blocksForDay, buildWeekGrid, dayKeyFor, toMinutes } from './schedule'
import type { SchedulePeriod } from './types'

const period: SchedulePeriod = {
  termCode: '26/2',
  termLabel: 'Ago–Dic 2026',
  year: 2026,
  description: 'Agosto - Diciembre 2026',
  courses: [
    {
      groupId: 55820,
      clave: 'IDD-2502',
      name: 'CIBERSEGURIDAD',
      groupLetter: 'A',
      planName: 'Ingeniería en Sistemas Computacionales',
      sessions: [
        { day: 'lunes', start: '12:00', end: '13:00', room: 'LRC' },
        { day: 'martes', start: '11:00', end: '13:00', room: 'LRC' },
      ],
    },
    {
      groupId: 56693,
      clave: 'SCG-1009',
      name: 'Gestión de Proyectos de Software',
      groupLetter: 'B',
      planName: null,
      sessions: [{ day: 'lunes', start: '15:00', end: '17:00', room: 'LIS' }],
    },
  ],
}

// Wednesday 4 Nov 2026, 15:30
const NOW = new Date(2026, 10, 4, 15, 30)

describe('schedule model', () => {
  it('parses times', () => {
    expect(toMinutes('09:30')).toBe(570)
  })

  it('maps dates to day keys', () => {
    expect(dayKeyFor(NOW)).toBe('miercoles')
    expect(dayKeyFor(new Date(2026, 10, 8))).toBeNull() // Sunday
  })

  it('builds a Monday–Friday grid spanning the earliest and latest class', () => {
    const grid = buildWeekGrid(period, NOW)
    expect(grid.days.map((d) => d.key)).toEqual(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])
    expect(grid.days.find((d) => d.isToday)?.key).toBe('miercoles')
    expect(grid.days[0].date).toBe(2) // Monday 2 Nov
    expect(grid.startHour).toBe(11)
    expect(grid.endHour).toBe(17)
    expect(grid.hours).toEqual([11, 12, 13, 14, 15, 16])
  })

  it('positions blocks proportionally', () => {
    const grid = buildWeekGrid(period, NOW)
    const monday = blocksForDay(grid, 'lunes')
    expect(monday.map((b) => b.clave)).toEqual(['IDD-2502', 'SCG-1009'])
    expect(monday[0].topPct).toBeCloseTo(((12 - 11) / 6) * 100)
    expect(monday[0].heightPct).toBeCloseTo((1 / 6) * 100)
  })

  it('computes weekly hours per course', () => {
    const grid = buildWeekGrid(period, NOW)
    expect(grid.legend.find((c) => c.clave === 'IDD-2502')?.weeklyHours).toBe(3)
  })
})
