import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import { formatNumber } from '@/shared/lib/format'
import { CapsuleBars, GlassCard, Skeleton } from '@/shared/ui'
import { useSemesterAverages } from '../hooks/useKardex'

/** "Progress" card of the reference: one capsule per semester average. */
export function SemesterAveragesCard() {
  const { data, bars, isPending, isError } = useSemesterAverages()

  if (isPending) return <Skeleton className="h-full min-h-80 rounded-[var(--radius-card)]" />

  return (
    <GlassCard className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xl font-light">Desempeño</p>
        <Link
          to="/kardex"
          aria-label="Ver kardex"
          className="inline-grid size-11 place-items-center rounded-full bg-white/80 transition hover:bg-white"
        >
          <ArrowUpRight className="size-5" aria-hidden />
        </Link>
      </div>
      {isError || !data ? (
        <p className="mt-4 text-sm text-muted">No se pudo cargar el kardex.</p>
      ) : (
        <>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-5xl font-extralight">{formatNumber(data.average)}</p>
            <p className="pb-1 text-sm leading-tight text-ink/70">
              Promedio
              <br />
              general
            </p>
          </div>
          <div className="mt-auto pt-6">
            <CapsuleBars bars={bars} min={60} max={100} height={130} />
          </div>
        </>
      )}
    </GlassCard>
  )
}
