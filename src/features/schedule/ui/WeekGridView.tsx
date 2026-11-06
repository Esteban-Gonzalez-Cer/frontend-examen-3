import { MapPin } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { toTitleCase } from '@/shared/lib/format'
import { hourLabel } from '../model/schedule'
import type { WeekGrid } from '../model/types'
import { BLOCK_CLASSES } from './palette'

interface WeekGridViewProps {
  grid: WeekGrid
  hourHeight?: number
  compact?: boolean
}

/** Agenda-style week: time rows on the left, one column per day, positioned class blocks. */
export function WeekGridView({ grid, hourHeight = 64, compact = false }: WeekGridViewProps) {
  const height = grid.hours.length * hourHeight
  return (
    <div className="overflow-x-auto">
      <div className={compact ? 'min-w-[460px]' : 'min-w-[640px]'}>
        <div className="grid" style={{ gridTemplateColumns: `${compact ? 48 : 64}px repeat(${grid.days.length}, minmax(0, 1fr))` }}>
          <div />
          {grid.days.map((day) => (
            <div key={day.key} className="pb-3 text-center">
              <p className={cn('text-sm', day.isToday ? 'text-ink' : 'text-muted')}>{day.short}</p>
              <p
                className={cn(
                  'mx-auto mt-0.5 grid size-8 place-items-center rounded-full text-base',
                  day.isToday ? 'bg-ink text-white' : 'text-ink/80',
                )}
              >
                {day.date}
              </p>
            </div>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: `${compact ? 48 : 64}px repeat(${grid.days.length}, minmax(0, 1fr))` }}>
          <div className="relative" style={{ height }}>
            {grid.hours.map((hour, i) => (
              <span key={hour} className="absolute -translate-y-2 text-xs text-muted" style={{ top: i * hourHeight }}>
                {hourLabel(hour)}
              </span>
            ))}
          </div>
          {grid.days.map((day) => (
            <div
              key={day.key}
              className={cn('relative border-l border-dashed border-ink/15', day.isToday && 'bg-white/25')}
              style={{ height }}
            >
              {grid.hours.map((hour, i) => (
                <span key={hour} className="absolute inset-x-0 border-t border-dashed border-ink/[0.07]" style={{ top: i * hourHeight }} />
              ))}
              {grid.blocks
                .filter((block) => block.day === day.key)
                .map((block) => (
                  <article
                    key={block.id}
                    className={cn(
                      'absolute inset-x-1 overflow-hidden rounded-2xl px-2.5 py-1.5 shadow-sm',
                      BLOCK_CLASSES[block.colorIndex],
                      block.isNow && 'ring-2 ring-accent ring-offset-2 ring-offset-transparent',
                    )}
                    style={{ top: `${block.topPct}%`, height: `calc(${block.heightPct}% - 4px)` }}
                    title={`${block.name} · ${block.start}–${block.end}${block.room ? ` · ${block.room}` : ''}`}
                  >
                    <p className={cn('leading-tight', compact ? 'line-clamp-2 text-[11px]' : 'line-clamp-2 text-xs sm:text-[13px]')}>
                      {toTitleCase(block.name)}
                    </p>
                    {!compact || block.heightPct > 12 ? (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] opacity-75">
                        <MapPin className="size-3" aria-hidden />
                        {block.room ?? 'Sin salón'} · {block.start}
                      </p>
                    ) : null}
                  </article>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
