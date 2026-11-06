import { CircleAlert, Inbox, LoaderCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from './Button'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-2xl bg-ink/[0.07]', className)} />
}

export function Spinner({ label = 'Cargando…', className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-muted', className)}>
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {label}
    </span>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title = 'No pudimos cargar la información', message, onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('glass flex flex-col items-start gap-3 p-6', className)}>
      <span className="inline-grid size-11 place-items-center rounded-full bg-risk-soft text-risk">
        <CircleAlert className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-lg">{title}</p>
        <p className="mt-1 text-sm text-muted">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="dark" size="sm" onClick={onRetry} icon={<RefreshCw className="size-4" aria-hidden />}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  message?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-10 text-center', className)}>
      <span className="inline-grid size-12 place-items-center rounded-full bg-white/70 text-muted">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </span>
      <p className="text-lg">{title}</p>
      {message ? <p className="max-w-sm text-sm text-muted">{message}</p> : null}
      {action}
    </div>
  )
}
