import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div' | 'aside'
  tone?: 'glass' | 'dark' | 'plain'
  children: ReactNode
}

export function GlassCard({ as: Tag = 'section', tone = 'glass', className, children, ...rest }: GlassCardProps) {
  return (
    <Tag
      className={cn(
        'relative p-5 sm:p-6',
        tone === 'glass' && 'glass',
        tone === 'dark' && 'rounded-[var(--radius-card)] bg-ink text-white shadow-[0_24px_50px_-30px_rgba(0,0,0,.7)]',
        tone === 'plain' && 'rounded-[var(--radius-card)] bg-white/80',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <header className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-xl font-normal tracking-tight sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}
