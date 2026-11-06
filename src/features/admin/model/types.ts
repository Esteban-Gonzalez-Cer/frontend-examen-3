export type SubjectKind = 'generic' | 'specialty' | 'special_requirement'

export interface AdminSubject {
  id: number | null
  clave: string
  name: string
  credits: number
  ht: number
  hp: number
  suggestedSemester: number
  gridRow: number
  gridCol: number
  kind: SubjectKind
  minCreditPct: number | null
  countsTowardLoad: boolean
}

export interface AdminRequisite {
  id: number
  subjectClave: string
  requiresClave: string
  type: 'prereq' | 'coreq'
}

export interface CurriculumRules {
  maxCreditsPerTerm: number
  minCreditsPerTerm: number
  summerMaxSubjects: number
  passingGrade: number
}

/** Form values are strings so inputs stay controlled while typing. */
export interface SubjectFormValues {
  clave: string
  name: string
  credits: string
  ht: string
  hp: string
  suggestedSemester: string
  gridRow: string
  gridCol: string
  kind: SubjectKind
  minCreditPct: string
  countsTowardLoad: boolean
}

export interface RequisiteFormValues {
  subjectClave: string
  requiresClave: string
  type: 'prereq' | 'coreq'
}

export type AdminTab = 'subjects' | 'requisites' | 'rules'
