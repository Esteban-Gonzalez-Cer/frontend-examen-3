import { useState } from 'react'

import { cn } from '@/shared/lib/cn'

// --------------------------------------------------------------------------- SegmentedProgress

export interface Segment {
  key: string
  label: string
  /** Share of the bar, 0–100. */
  value: number
  display: string
  tone: 'ink' | 'accent' | 'stripes' | 'outline'
}

export function SegmentedProgress({ segments, className }: { segments: Segment[]; className?: string }) {
  const visible = segments.filter((s) => s.value > 0)
  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap gap-2" role="img" aria-label={visible.map((s) => `${s.label} ${s.display}`).join(', ')}>
        {visible.map((segment) => (
          <div key={segment.key} className="min-w-[96px]" style={{ flexGrow: segment.value, flexBasis: 0 }}>
            <p className="mb-2 truncate text-sm text-ink/80">{segment.label}</p>
            <div
              className={cn(
                'flex h-12 items-center rounded-full px-4 text-sm',
                segment.tone === 'ink' && 'bg-ink text-white',
                segment.tone === 'accent' && 'bg-accent text-ink',
                segment.tone === 'stripes' && 'stripes border border-ink/10 text-ink',
                segment.tone === 'outline' && 'border border-ink/30 text-ink',
              )}
            >
              {segment.display}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------- RadialGauge

interface RadialGaugeProps {
  value: number
  label: string
  center: string
  size?: number
}

/** Yellow arc + dashed ticks, like the "time tracker" of the reference. */
export function RadialGauge({ value, label, center, size = 210 }: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const ticks = Array.from({ length: 60 }, (_, i) => i)
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="size-full -rotate-90" role="img" aria-label={`${label}: ${center}`}>
        {ticks.map((i) => {
          const angle = (i / 60) * 2 * Math.PI
          const inner = 66
          const outer = i % 5 === 0 ? 74 : 71
          return (
            <line
              key={i}
              x1={100 + inner * Math.cos(angle)}
              y1={100 + inner * Math.sin(angle)}
              x2={100 + outer * Math.cos(angle)}
              y2={100 + outer * Math.sin(angle)}
              stroke="currentColor"
              strokeWidth={1}
              className="text-ink/30"
            />
          )
        })}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="currentColor" strokeWidth="14" className="text-ink/[0.06]" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
          className="text-accent transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="text-4xl font-light tracking-tight">{center}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------- CapsuleBars

export interface CapsuleBar {
  key: string
  label: string
  value: number | null
  tooltip?: string
  highlight?: boolean
}

interface CapsuleBarsProps {
  bars: CapsuleBar[]
  min: number
  max: number
  height?: number
}

/**
 * Thin rounded bars with a dot under each, like the "progress" card of the reference.
 * Each bar is a button: selecting one shows its value in the yellow bubble.
 * Starts on the highlighted bar (or the last one with a value).
 */
export function CapsuleBars({ bars, min, max, height = 150 }: CapsuleBarsProps) {
  const range = Math.max(1, max - min)
  const fallbackKey = (bars.find((b) => b.highlight) ?? [...bars].reverse().find((b) => b.value !== null))?.key ?? null
  const [picked, setPicked] = useState<string | null>(null)
  const selectedKey = picked !== null && bars.some((b) => b.key === picked) ? picked : fallbackKey
  const selected = bars.find((b) => b.key === selectedKey)

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-ink/15" aria-hidden />
      <ul className="relative flex items-end justify-between gap-2 pt-9" style={{ height: height + 36 }}>
        {bars.map((bar) => {
          const pct = bar.value === null ? 0.3 : Math.max(0.12, (bar.value - min) / range)
          const isSelected = bar.key === selectedKey
          const text = bar.tooltip ?? (bar.value === null ? '—' : String(bar.value))
          return (
            <li key={bar.key} className="flex h-full flex-1 flex-col items-center justify-end">
              <button
                type="button"
                onClick={() => setPicked(bar.key)}
                aria-pressed={isSelected}
                aria-label={`${bar.label}: ${bar.value === null ? 'sin promedio' : text}`}
                className="group flex h-full w-full cursor-pointer flex-col items-center justify-end rounded-xl outline-offset-4"
              >
                <span className="relative flex w-full justify-center" style={{ height: `${pct * 100}%` }}>
                  {isSelected ? (
                    <span className="absolute bottom-full mb-2 rounded-full bg-accent px-2.5 py-1 text-xs whitespace-nowrap tabular-nums shadow-sm">
                      {text}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'h-full w-2.5 rounded-full transition-[height,background-color,width] duration-500',
                      bar.value === null ? 'stripes bg-ink/5' : isSelected ? 'w-3 bg-accent' : 'bg-ink group-hover:bg-ink/70',
                    )}
                  />
                </span>
                <span
                  className={cn('mt-2 size-1.5 shrink-0 rounded-full transition-colors', isSelected ? 'bg-accent' : 'bg-ink')}
                  aria-hidden
                />
              </button>
            </li>
          )
        })}
      </ul>
      <ul className="mt-3 flex justify-between gap-2 text-center text-sm">
        {bars.map((bar) => (
          <li key={bar.key} className={cn('flex-1 transition-colors', bar.key === selectedKey ? 'text-ink' : 'text-muted')}>
            {bar.label}
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">
        {selected ? `${selected.label}: ${selected.tooltip ?? selected.value ?? 'sin promedio'}` : ''}
      </p>
    </div>
  )
}
