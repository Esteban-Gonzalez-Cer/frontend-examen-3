import { cn } from '@/shared/lib/cn'
import { GlassCard } from '@/shared/ui'
import { semaphoreItems } from '../model/grades'
import type { GradeLevel, LevelFilter } from '../model/types'

const DOT: Record<GradeLevel, string> = {
  good: 'bg-good',
  warning: 'bg-warn',
  risk: 'bg-risk',
  none: 'stripes bg-ink/10',
}

const GLOW: Record<GradeLevel, string> = {
  good: 'shadow-[0_0_0_4px_var(--color-good-soft)]',
  warning: 'shadow-[0_0_0_4px_var(--color-warn-soft)]',
  risk: 'shadow-[0_0_0_4px_var(--color-risk-soft)]',
  none: '',
}

interface Props {
  counts: Record<GradeLevel, number>
  active: LevelFilter
  onSelect: (level: LevelFilter) => void
  className?: string
}

export function PerformanceSemaphore({ counts, active, onSelect, className }: Props) {
  const items = semaphoreItems(counts)
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <GlassCard className={cn('flex flex-col', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">Semáforo de desempeño</p>
        <p className="text-xs text-muted tabular-nums">
          {total} {total === 1 ? 'materia' : 'materias'}
        </p>
      </div>

      <div
        className="mt-4 flex h-3 gap-1"
        role="img"
        aria-label={items.map((item) => `${item.count} ${item.label.toLowerCase()}`).join(', ')}
      >
        {items
          .filter((item) => item.count > 0)
          .map((item) => (
            <span
              key={item.level}
              className={cn('h-full rounded-full transition-all', DOT[item.level])}
              style={{ flexGrow: item.share, flexBasis: 0 }}
            />
          ))}
        {total === 0 ? <span className="stripes h-full flex-1 rounded-full" /> : null}
      </div>

      <div className={cn('mt-4 grid flex-1 gap-2', items.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}>
        {items.map((item) => {
          const selected = active === item.level
          const filterable = item.level !== 'none'
          return (
            <button
              key={item.level}
              type="button"
              disabled={!filterable}
              aria-pressed={filterable ? selected : undefined}
              title={filterable ? (selected ? 'Quitar filtro' : `Ver solo ${item.label.toLowerCase()}`) : undefined}
              onClick={() => onSelect(selected ? 'all' : (item.level as LevelFilter))}
              className={cn(
                'flex min-w-0 flex-col justify-between rounded-2xl px-3.5 py-3 text-left transition',
                selected ? 'bg-ink text-white' : 'bg-white/55 ring-1 ring-white/80',
                filterable && !selected && 'hover:bg-white/85',
                !filterable && 'cursor-default',
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn('size-2.5 shrink-0 rounded-full', DOT[item.level], item.count > 0 && GLOW[item.level])} aria-hidden />
                <span className={cn('truncate text-xs', selected ? 'text-white/80' : 'text-ink/80')}>{item.label}</span>
              </span>
              <span className="mt-2 flex items-baseline justify-between gap-2">
                <span className={cn('text-4xl font-extralight tabular-nums', item.count === 0 && !selected && 'text-ink/30')}>
                  {item.count}
                </span>
                <span className={cn('text-[11px] tabular-nums', selected ? 'text-white/60' : 'text-muted')}>{item.range}</span>
              </span>
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}
