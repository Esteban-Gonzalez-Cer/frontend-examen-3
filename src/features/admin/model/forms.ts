import { z } from 'zod'

import { normalizeText } from '@/shared/lib/format'
import type {
  AdminRequisite,
  AdminSubject,
  CurriculumRules,
  RequisiteFormValues,
  SubjectFormValues,
  SubjectKind,
} from './types'

export const KIND_TONE: Record<SubjectKind, 'accent' | 'ink' | 'none'> = {
  generic: 'none',
  specialty: 'accent',
  special_requirement: 'ink',
}

export const KIND_LABEL: Record<SubjectKind, string> = {
  generic: 'Genérica',
  specialty: 'Especialidad',
  special_requirement: 'Requisito especial',
}

const intIn = (min: number, max: number, label: string) =>
  z.coerce.number({ message: `${label}: número inválido.` }).int(`${label}: debe ser entero.`).min(min, `${label}: mínimo ${min}.`).max(max, `${label}: máximo ${max}.`)

const subjectSchema = z.object({
  clave: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,20}$/, 'Clave: 3 a 20 caracteres (letras, números y guiones).'),
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
  credits: intIn(0, 20, 'Créditos'),
  ht: intIn(0, 20, 'Horas teoría'),
  hp: intIn(0, 20, 'Horas práctica'),
  suggestedSemester: intIn(1, 12, 'Semestre'),
  gridRow: intIn(1, 12, 'Fila'),
  gridCol: intIn(1, 12, 'Columna'),
  kind: z.enum(['generic', 'specialty', 'special_requirement']),
  minCreditPct: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 100), '% de créditos: entre 0 y 100.'),
  countsTowardLoad: z.boolean(),
})

export type SubjectPayload = Omit<AdminSubject, 'id'>

export function emptySubjectForm(): SubjectFormValues {
  return {
    clave: '',
    name: '',
    credits: '5',
    ht: '2',
    hp: '3',
    suggestedSemester: '1',
    gridRow: '1',
    gridCol: '1',
    kind: 'generic',
    minCreditPct: '',
    countsTowardLoad: true,
  }
}

export function subjectToForm(subject: AdminSubject): SubjectFormValues {
  return {
    clave: subject.clave,
    name: subject.name,
    credits: String(subject.credits),
    ht: String(subject.ht),
    hp: String(subject.hp),
    suggestedSemester: String(subject.suggestedSemester),
    gridRow: String(subject.gridRow),
    gridCol: String(subject.gridCol),
    kind: subject.kind,
    minCreditPct: subject.minCreditPct === null ? '' : String(subject.minCreditPct),
    countsTowardLoad: subject.countsTowardLoad,
  }
}

export type FormResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> }

function issuesToErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}

export function parseSubjectForm(values: SubjectFormValues): FormResult<SubjectPayload> {
  const parsed = subjectSchema.safeParse(values)
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, errors: issuesToErrors(parsed.error.issues) }
}

const rulesSchema = z
  .object({
    maxCreditsPerTerm: intIn(4, 60, 'Carga máxima'),
    minCreditsPerTerm: intIn(0, 60, 'Carga mínima'),
    summerMaxSubjects: intIn(0, 6, 'Materias en verano'),
    passingGrade: intIn(50, 100, 'Calificación aprobatoria'),
  })
  .refine((r) => r.minCreditsPerTerm <= r.maxCreditsPerTerm, {
    message: 'La carga mínima no puede superar la máxima.',
    path: ['minCreditsPerTerm'],
  })

export type RulesFormValues = Record<keyof CurriculumRules, string>

export function rulesToForm(rules: CurriculumRules): RulesFormValues {
  return {
    maxCreditsPerTerm: String(rules.maxCreditsPerTerm),
    minCreditsPerTerm: String(rules.minCreditsPerTerm),
    summerMaxSubjects: String(rules.summerMaxSubjects),
    passingGrade: String(rules.passingGrade),
  }
}

export function parseRulesForm(values: RulesFormValues): FormResult<CurriculumRules> {
  const parsed = rulesSchema.safeParse(values)
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, errors: issuesToErrors(parsed.error.issues) }
}

export function validateRequisite(values: RequisiteFormValues): string | null {
  if (!values.subjectClave || !values.requiresClave) return 'Elige ambas materias.'
  if (values.subjectClave === values.requiresClave) return 'Una materia no puede requerirse a sí misma.'
  return null
}

export function filterSubjects(subjects: AdminSubject[], rawQuery: string): AdminSubject[] {
  const query = normalizeText(rawQuery)
  if (!query) return subjects
  return subjects.filter((s) => normalizeText(`${s.clave} ${s.name} semestre ${s.suggestedSemester}`).includes(query))
}

export interface RequisiteRow extends AdminRequisite {
  subjectName: string
  requiresName: string
}

export function requisiteRows(requisites: AdminRequisite[], subjects: AdminSubject[], rawQuery = ''): RequisiteRow[] {
  const names = new Map(subjects.map((s) => [s.clave, s.name]))
  const query = normalizeText(rawQuery)
  return requisites
    .map((r) => ({
      ...r,
      subjectName: names.get(r.subjectClave) ?? r.subjectClave,
      requiresName: names.get(r.requiresClave) ?? r.requiresClave,
    }))
    .filter((r) => !query || normalizeText(`${r.subjectClave} ${r.subjectName} ${r.requiresClave} ${r.requiresName}`).includes(query))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName))
}

export function totalCredits(subjects: AdminSubject[]): number {
  return subjects.reduce((sum, s) => sum + s.credits, 0)
}
