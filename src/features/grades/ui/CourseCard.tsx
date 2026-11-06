import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { GlassCard } from '@/shared/ui'
import { gradeLevel } from '../model/grades'
import type { CourseGrades, GradeLevel } from '../model/types'

const levelText: Record<GradeLevel, string> = {
  good: 'text-good',
  warning: 'text-warn',
  risk: 'text-risk',
  none: 'text-muted',
}

const levelBar: Record<GradeLevel, string> = {
  good: 'bg-good',
  warning: 'bg-warn',
  risk: 'bg-risk',
  none: 'bg-ink/15',
}

export function CourseCard({ course, termLabel }: { course: CourseGrades; termLabel: string }) {
  return (
    <GlassCard as="article" className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug">{course.name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {course.clave} · Grupo {course.groupLetter} · {termLabel}
          </p>
        </div>
       
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className={cn('text-5xl font-extralight', levelText[course.level])}>{formatNumber(course.average)}</p>
          <p className="text-xs text-muted">{course.final !== null ? 'Calificación final' : 'Promedio de parciales capturados'}</p>
        </div>
        <ol className="flex gap-1.5" aria-label="Parciales">
          {course.partials.map((partial) => {
            const level = gradeLevel(partial.grade)
            return (
              <li key={partial.number} className="flex flex-col items-center gap-1">
                <span
                  className="flex h-14 w-9 flex-col justify-end overflow-hidden rounded-full bg-ink/[0.06]"
                  title={`Parcial ${partial.number}: ${partial.grade ?? 'sin capturar'}`}
                >
                  <span
                    className={cn('block w-full rounded-full', partial.grade === null ? 'stripes h-full' : levelBar[level])}
                    style={{ height: partial.grade === null ? '100%' : `${Math.max(18, partial.grade)}%` }}
                  />
                </span>
                <span className="text-xs tabular-nums text-ink/80">{partial.grade ?? '—'}</span>
                <span className="text-[10px] text-muted">P{partial.number}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </GlassCard>
  )
}
