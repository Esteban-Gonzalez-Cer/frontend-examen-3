import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { initials } from '@/shared/lib/format'

export type Tone = 'good' | 'warning' | 'risk' | 'none' | 'ink' | 'accent' | 'outline'

const toneClasses: Record<Tone, string> = {
  good: 'bg-good-soft text-good',
  warning: 'bg-warn-soft text-warn',
  risk: 'bg-risk-soft text-risk',
  none: 'bg-ink/5 text-muted',
  ink: 'bg-ink text-white',
  accent: 'bg-accent text-ink',
  outline: 'border border-ink/15 text-ink',
}

export function Badge({ tone = 'none', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', toneClasses[tone], className)}>
      {children}
    </span>
  )
}

export function Avatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', className)} />
  }
  return (
    <span aria-label={name} className={cn('inline-grid place-items-center rounded-full bg-accent text-ink', className)}>
      {initials(name)}
    </span>
  )
}

interface StatNumberProps {
  value: ReactNode
  label: string
  icon?: ReactNode
  className?: string
}

export function StatNumber({ value, label, icon, className }: StatNumberProps) {
  return (
    <div className={cn('flex items-end gap-2', className)}>
      {icon ? (
        <span className="mb-7 hidden size-7 place-items-center rounded-full bg-white/70 text-ink/70 sm:inline-grid">{icon}</span>
      ) : null}
      <div>
        <p className="text-4xl leading-none font-extralight tracking-tight sm:text-6xl lg:text-7xl">{value}</p>
        <p className="mt-1 text-sm text-ink/80">{label}</p>
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

export function Accordion({ items, defaultOpenId }: { items: AccordionItem[]; defaultOpenId?: string }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)
  const baseId = useId()
  return (
    <div className="divide-y divide-dashed divide-ink/15">
      {items.map((item) => {
        const open = openId === item.id
        const panelId = `${baseId}-${item.id}`
        return (
          <div key={item.id} className="py-1">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 py-3 text-left text-lg"
            >
              {item.title}
              <ChevronDown className={cn('size-5 shrink-0 transition', open && 'rotate-180')} aria-hidden />
            </button>
            {open ? (
              <div id={panelId} className="pb-3 text-sm text-ink/80">
                {item.content}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}
