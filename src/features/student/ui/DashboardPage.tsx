import { ArrowUpRight, BookOpen, GraduationCap, Layers, Route as RouteIcon } from 'lucide-react'
import { Link } from 'react-router'

import { CurrentTermCard } from '@/features/grades'
import { SemesterAveragesCard } from '@/features/kardex'
import { WeekAgendaCard } from '@/features/schedule'
import { formatPct, toTitleCase } from '@/shared/lib/format'
import {
  Accordion,
  Avatar,
  ErrorState,
  GlassCard,
  KeyValue,
  RadialGauge,
  SegmentedProgress,
  Skeleton,
  StatNumber,
} from '@/shared/ui'
import { useDashboard } from '../hooks/useDashboard'

export function DashboardPage() {
  const { profile, derived, isPending, isError, errorText, refetch } = useDashboard()

  if (isPending) return <DashboardSkeleton />
  if (isError || !profile || !derived) {
    return <ErrorState message={errorText ?? ''} onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_1fr] xl:items-end">
        <div>
          <h1 className="text-5xl font-light tracking-tight sm:text-6xl">Bienvenido, {derived.name}</h1>
          <SegmentedProgress className="mt-8 max-w-3xl" segments={derived.segments} />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-6 xl:justify-end xl:gap-10">
          <StatNumber value={profile.creditsAccumulated} label="Créditos" icon={<Layers className="size-3.5" aria-hidden />} />
          <StatNumber value={profile.subjectsApproved} label="Aprobadas" icon={<BookOpen className="size-3.5" aria-hidden />} />
          <StatNumber value={profile.semester} label="Semestre" icon={<GraduationCap className="size-3.5" aria-hidden />} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="relative min-h-80 overflow-hidden rounded-[var(--radius-card)] bg-[#ddd5df]">
          <Avatar src={profile.photoDataUrl} name={toTitleCase(profile.fullName)} className="absolute inset-0 size-full rounded-none text-6xl" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16 text-white">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-2xl leading-tight font-light">{toTitleCase(profile.fullName)}</p>
                <p className="text-sm text-white/75">Ing. en Sistemas Computacionales</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/70 px-3 py-1.5 text-sm">{profile.numeroControl}</span>
            </div>
          </div>
        </article>

        <SemesterAveragesCard />

        <GlassCard className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <p className="text-2xl font-light">Avance</p>
            <Link
              to="/kardex"
              aria-label="Ver avance en el kardex"
              className="inline-grid size-11 place-items-center rounded-full bg-white/80 transition hover:bg-white"
            >
              <ArrowUpRight className="size-5" aria-hidden />
            </Link>
          </div>
          <div className="my-auto py-3">
            <RadialGauge value={profile.progressPct} center={formatPct(profile.progressPct)} label="de la carrera" size={200} />
          </div>
          <p className="text-center text-sm text-muted">
            {profile.creditsAccumulated} créditos acreditados
          </p>
        </GlassCard>

        <div className="md:row-span-2">
          <CurrentTermCard />
        </div>

        <div className="flex flex-col gap-4">
          <GlassCard>
            <Accordion
              defaultOpenId="averages"
              items={derived.facts.map((group) => ({
                id: group.id,
                title: group.title,
                content: (
                  <div>
                    {group.facts.map((fact) => (
                      <KeyValue key={fact.label} label={fact.label} value={fact.value} />
                    ))}
                  </div>
                ),
              }))}
            />
          </GlassCard>
          <Link
            to="/simulador"
            className="group glass flex items-center justify-between gap-3 p-5 transition hover:bg-white/80"
          >
            <span className="flex items-center gap-3">
              <span className="inline-grid size-11 place-items-center rounded-full bg-accent">
                <RouteIcon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-lg">Simulador What-If</span>
                <span className="block text-sm text-muted">Tu ruta crítica a la titulación</span>
              </span>
            </span>
            <ArrowUpRight className="size-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </Link>
        </div>

        <div className="md:col-span-2">
          <WeekAgendaCard />
        </div>
      </section>

    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <Skeleton className="h-14 w-80" />
      <Skeleton className="h-20 max-w-3xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-80 rounded-[var(--radius-card)]" />
        ))}
      </div>
    </div>
  )
}
