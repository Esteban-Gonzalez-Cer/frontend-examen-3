import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { errorMessage } from '@/shared/api/errors'
import * as api from '../api/adminApi'
import {
  emptySubjectForm,
  filterSubjects,
  parseRulesForm,
  parseSubjectForm,
  requisiteRows,
  rulesToForm,
  subjectToForm,
  totalCredits,
  validateRequisite,
  type RulesFormValues,
} from '../model/forms'
import type { AdminSubject, AdminTab, RequisiteFormValues, SubjectFormValues } from '../model/types'

const keys = {
  subjects: ['admin', 'subjects'] as const,
  requisites: ['admin', 'requisites'] as const,
  rules: ['admin', 'rules'] as const,
}

/** Curriculum edits change every simulation, so drop cached What-If results too. */
function useInvalidate() {
  const queryClient = useQueryClient()
  return (...extra: (readonly string[])[]) => {
    for (const key of extra) queryClient.invalidateQueries({ queryKey: key })
    queryClient.invalidateQueries({ queryKey: ['whatif'] })
  }
}

export function useAdminTabs() {
  const [tab, setTab] = useState<AdminTab>('subjects')
  return { tab, setTab }
}

// --------------------------------------------------------------------------- subjects

export function useSubjectsPanel() {
  const invalidate = useInvalidate()
  const subjects = useQuery({ queryKey: keys.subjects, queryFn: api.fetchSubjects })
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ mode: 'create' | 'edit'; values: SubjectFormValues } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const save = useMutation({
    mutationFn: (args: { mode: 'create' | 'edit'; values: SubjectFormValues }) => {
      const parsed = parseSubjectForm(args.values)
      if (!parsed.ok) {
        setErrors(parsed.errors)
        return Promise.reject(new Error('Revisa los campos marcados.'))
      }
      return args.mode === 'create' ? api.createSubject(parsed.data) : api.updateSubject(parsed.data)
    },
    onSuccess: () => {
      setEditing(null)
      setErrors({})
      invalidate(keys.subjects, keys.requisites)
    },
  })

  const remove = useMutation({
    mutationFn: api.deleteSubject,
    onSuccess: () => invalidate(keys.subjects, keys.requisites),
  })

  const list = useMemo(() => subjects.data ?? [], [subjects.data])

  return {
    ...subjects,
    search,
    setSearch,
    filtered: useMemo(() => filterSubjects(list, search), [list, search]),
    totalCredits: totalCredits(list),
    count: list.length,
    editing,
    errors,
    startCreate: () => {
      setErrors({})
      save.reset()
      setEditing({ mode: 'create', values: emptySubjectForm() })
    },
    startEdit: (subject: AdminSubject) => {
      setErrors({})
      save.reset()
      setEditing({ mode: 'edit', values: subjectToForm(subject) })
    },
    setField: <K extends keyof SubjectFormValues>(field: K, value: SubjectFormValues[K]) =>
      setEditing((prev) => (prev ? { ...prev, values: { ...prev.values, [field]: value } } : prev)),
    cancel: () => setEditing(null),
    submit: () => editing && save.mutate(editing),
    saving: save.isPending,
    saveError: save.isError && !Object.keys(errors).length ? errorMessage(save.error) : null,
    remove: (clave: string) => remove.mutate(clave),
    removeError: remove.isError ? errorMessage(remove.error) : null,
    removingClave: remove.isPending ? remove.variables : null,
  }
}

// --------------------------------------------------------------------------- requisites

export function useRequisitesPanel() {
  const invalidate = useInvalidate()
  const subjects = useQuery({ queryKey: keys.subjects, queryFn: api.fetchSubjects })
  const requisites = useQuery({ queryKey: keys.requisites, queryFn: api.fetchRequisites })
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<RequisiteFormValues>({ subjectClave: '', requiresClave: '', type: 'prereq' })
  const [formError, setFormError] = useState<string | null>(null)

  const add = useMutation({
    mutationFn: api.createRequisite,
    onSuccess: () => {
      setForm((prev) => ({ ...prev, requiresClave: '' }))
      invalidate(keys.requisites)
    },
  })
  const remove = useMutation({ mutationFn: api.deleteRequisite, onSuccess: () => invalidate(keys.requisites) })

  const subjectList = useMemo(() => subjects.data ?? [], [subjects.data])
  const rows = useMemo(
    () => requisiteRows(requisites.data ?? [], subjectList, search),
    [requisites.data, subjectList, search],
  )

  return {
    isPending: subjects.isPending || requisites.isPending,
    isError: subjects.isError || requisites.isError,
    errorText: subjects.error || requisites.error ? errorMessage(subjects.error ?? requisites.error) : null,
    refetch: () => {
      subjects.refetch()
      requisites.refetch()
    },
    subjects: subjectList,
    rows,
    search,
    setSearch,
    form,
    setForm: (patch: Partial<RequisiteFormValues>) => {
      setFormError(null)
      add.reset()
      setForm((prev) => ({ ...prev, ...patch }))
    },
    submit: () => {
      const problem = validateRequisite(form)
      if (problem) {
        setFormError(problem)
        return
      }
      add.mutate(form)
    },
    adding: add.isPending,
    formError: formError ?? (add.isError ? errorMessage(add.error) : null),
    remove: (id: number) => remove.mutate(id),
    removingId: remove.isPending ? remove.variables : null,
  }
}

// --------------------------------------------------------------------------- rules

export function useRulesPanel() {
  const invalidate = useInvalidate()
  const rules = useQuery({ queryKey: keys.rules, queryFn: api.fetchRules })
  // Local edits on top of the server values; null means "show what the server has".
  const [draft, setDraft] = useState<RulesFormValues | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const values = draft ?? (rules.data ? rulesToForm(rules.data) : null)

  const save = useMutation({
    mutationFn: api.saveRules,
    onSuccess: () => {
      setDraft(null)
      invalidate(keys.rules)
    },
  })

  return {
    ...rules,
    values,
    errors,
    setField: (field: keyof RulesFormValues, value: string) => {
      save.reset()
      if (values) setDraft({ ...values, [field]: value })
    },
    submit: () => {
      if (!values) return
      const parsed = parseRulesForm(values)
      if (!parsed.ok) {
        setErrors(parsed.errors)
        return
      }
      setErrors({})
      save.mutate(parsed.data)
    },
    saving: save.isPending,
    saved: save.isSuccess,
    saveError: save.isError ? errorMessage(save.error) : null,
  }
}
