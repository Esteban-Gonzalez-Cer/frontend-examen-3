import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { errorMessage } from '@/shared/api/errors'

import { fetchProfile } from '../api/studentApi'
import { academicFacts, greetingName, progressSegments } from '../model/dashboard'

export const profileQueryKey = ['student', 'profile'] as const

export function useStudentProfile() {
  return useQuery({ queryKey: profileQueryKey, queryFn: fetchProfile })
}

export function useDashboard() {
  const query = useStudentProfile()
  const profile = query.data
  const derived = useMemo(
    () =>
      profile
        ? {
            name: greetingName(profile),
            segments: progressSegments(profile),
            facts: academicFacts(profile),
          }
        : null,
    [profile],
  )
  return { ...query, profile, derived, errorText: query.error ? errorMessage(query.error) : null }
}
